import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import {
  Clock,
  Plus,
  X,
  Calendar,
  Copy,
  Save,
  Globe,
  ChevronDown,
  ChevronUp,
  Trash2,
  Building2,
  AlertCircle,
} from "lucide-react";
import { OpeningHours as OpeningHoursType } from "@/types/settings";
import { useBranchContext } from "@/contexts/BranchContext";
import { openingHoursService } from "@/services/openingHoursService";
import { specialHoursService } from "@/services/specialHoursService";
import { toast } from "sonner";
import SettingsHeader from "@/components/layout/SettingsHeader";
import { LoadingPlaceholder, EmptyPlaceholder } from "@/components/ui";

interface TimeSlot {
  start: string;
  end: string;
  label?: string;
}

interface SpecialHours {
  id?: string;
  date: string;
  is_open: boolean;
  time_slots: TimeSlot[];
  note: string;
  isActive: boolean;
}

const OpeningHoursPage: React.FC = () => {
  // Use branch context instead of local state
  const { selectedBranch, branches, handleBranchChange } = useBranchContext();
  const [isSaving, setIsSaving] = useState(false);
  const [openingHours, setOpeningHours] = useState<OpeningHoursType>({
    monday: { is_open: false, time_slots: [] },
    tuesday: { is_open: false, time_slots: [] },
    wednesday: { is_open: false, time_slots: [] },
    thursday: { is_open: false, time_slots: [] },
    friday: { is_open: false, time_slots: [] },
    saturday: { is_open: false, time_slots: [] },
    sunday: { is_open: false, time_slots: [] },
  });
  const [specialHours, setSpecialHours] = useState<SpecialHours[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpecialHoursExpanded, setIsSpecialHoursExpanded] = useState(false);

  // Convert API Branch to Settings Branch
  // const convertApiBranchToSettingsBranch = (apiBranch: ApiBranch): SettingsBranch => ({
  //   id: apiBranch.id,
  //   name: apiBranch.name,
  //   status: apiBranch.is_active ? 'active' : 'inactive',
  //   timezone: apiBranch.timezone
  // });

  // Helper function to convert 12-hour format to 24-hour format
  const convertTo24HourFormat = (time12h: string): string => {
    if (!time12h) return "00:00";

    // Handle different time formats
    let time = time12h.trim();

    // If already in 24-hour format, return as is
    if (/^\d{1,2}:\d{2}$/.test(time)) {
      return time;
    }

    // Convert 12-hour format to 24-hour format
    const [timePart, period] = time.split(" ");
    const [hours, minutes] = timePart.split(":");

    let hour24 = parseInt(hours);

    if (period === "PM" && hour24 !== 12) {
      hour24 += 12;
    } else if (period === "AM" && hour24 === 12) {
      hour24 = 0;
    }

    return `${hour24.toString().padStart(2, "0")}:${minutes}`;
  };

  // Helper function to convert 24-hour format to 12-hour format
  const convertFrom24HourFormat = (time24h: string): string => {
    if (!time24h) return "12:00 AM";

    const [hours, minutes] = time24h.split(":").map(Number);
    let period = "AM";
    let hour12 = hours;

    if (hours >= 12) {
      period = "PM";
      if (hours > 12) {
        hour12 = hours - 12;
      }
    } else if (hours === 0) {
      hour12 = 12;
    }

    return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  // Helper function to convert 12-hour format to minutes for comparison
  const timeToMinutes = (time12h: string): number => {
    if (!time12h) return 0;

    const [timePart, period] = time12h.split(" ");
    const [hours, minutes] = timePart.split(":").map(Number);

    let totalMinutes = hours * 60 + minutes;

    if (period === "PM" && hours !== 12) {
      totalMinutes += 12 * 60;
    } else if (period === "AM" && hours === 12) {
      totalMinutes -= 12 * 60;
    }

    return totalMinutes;
  };

  const minutesToTime = (totalMinutes: number): string => {
    if (totalMinutes < 0) totalMinutes = 0;
    if (totalMinutes >= 24 * 60) totalMinutes = 24 * 60 - 1; // Cap at 11:59 PM

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    let displayHours = hours;
    let period = "AM";

    if (hours === 0) {
      displayHours = 12;
      period = "AM";
    } else if (hours < 12) {
      displayHours = hours;
      period = "AM";
    } else if (hours === 12) {
      displayHours = 12;
      period = "PM";
    } else {
      displayHours = hours - 12;
      period = "PM";
    }

    const formattedMinutes = minutes.toString().padStart(2, "0");
    return `${displayHours}:${formattedMinutes} ${period}`;
  };

  // Validation functions
  const validateTimeSlot = (start: string, end: string): string | null => {
    if (!start || !end) return "Start and end times are required";

    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);

    if (startMinutes >= endMinutes) {
      return "End time must be after start time";
    }

    return null;
  };

  const validateTimeSlotsForDay = (day: keyof OpeningHoursType): string[] => {
    const dayHours = openingHours[day] as any;
    if (!dayHours) {
      return [];
    }

    const errors: string[] = [];

    // Check if day is open but has no time slots
    if (
      dayHours.is_open &&
      (!dayHours.time_slots || dayHours.time_slots.length === 0)
    ) {
      errors.push(`${day} is marked as open but has no time slots`);
      return errors;
    }

    // If day is closed, no need to validate time slots
    if (!dayHours.is_open) {
      return [];
    }

    const slots = dayHours.time_slots || [];

    // Validate each time slot
    slots.forEach((slot: any, index: number) => {
      const slotError = validateTimeSlot(slot.start, slot.end);
      if (slotError) {
        errors.push(`${day} slot ${index + 1}: ${slotError}`);
      }
    });

    // Check for overlapping time slots
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        const slot1 = slots[i];
        const slot2 = slots[j];

        const start1 = timeToMinutes(slot1.start);
        const end1 = timeToMinutes(slot1.end);
        const start2 = timeToMinutes(slot2.start);
        const end2 = timeToMinutes(slot2.end);

        // Check for overlap
        if (start1 < end2 && end1 > start2) {
          errors.push(`${day}: Time slots ${i + 1} and ${j + 1} overlap`);
        }
      }
    }

    return errors;
  };

  const validateAllOpeningHours = (): string[] => {
    const allErrors: string[] = [];

    // Auto-fix invalid time slots before validation
    const fixedSpecialHours = specialHours.map(special => {
      if (special.time_slots && special.time_slots.length > 0) {
        const fixedTimeSlots = special.time_slots.map((slot: any) => {
          const startMinutes = timeToMinutes(slot.start);
          const endMinutes = timeToMinutes(slot.end);
          
          if (startMinutes >= endMinutes) {
            // Fix by adding 1 hour to the end time
            const fixedEndMinutes = startMinutes + 60;
            const fixedEndTime = minutesToTime(fixedEndMinutes);
            
            console.log(`Auto-fixed invalid time slot during validation: ${slot.start} to ${slot.end} -> ${slot.start} to ${fixedEndTime}`);
            
            return {
              ...slot,
              end: fixedEndTime
            };
          }
          
          return slot;
        });
        
        // Sort time slots by start time to ensure proper order
        const sortedTimeSlots = fixedTimeSlots.sort((a: any, b: any) => {
          const startA = timeToMinutes(a.start);
          const startB = timeToMinutes(b.start);
          return startA - startB;
        });
        
        return {
          ...special,
          time_slots: sortedTimeSlots
        };
      }
      
      return special;
    });
    
    // Update the state with fixed time slots if any were fixed
    const hasChanges = JSON.stringify(fixedSpecialHours) !== JSON.stringify(specialHours);
    if (hasChanges) {
      setSpecialHours(fixedSpecialHours);
    }

    // Validate regular opening hours
    Object.keys(openingHours).forEach((day) => {
      const dayErrors = validateTimeSlotsForDay(day as keyof OpeningHoursType);
      allErrors.push(...dayErrors);
    });

    // Validate special hours (use fixed version)
    fixedSpecialHours.forEach((special, index) => {
      if (special.isActive) {
        if (!special.date) {
          allErrors.push(`Special hours ${index + 1}: Date is required`);
        }

        // If special hours are open, they must have at least one time slot
        if (
          special.is_open &&
          (!special.time_slots || special.time_slots.length === 0)
        ) {
          allErrors.push(
            `Special hours ${
              index + 1
            }: At least one time slot is required when open`
          );
        }

        if (special.time_slots && special.time_slots.length > 0) {
          special.time_slots.forEach((slot, slotIndex) => {
            if (!slot.start || !slot.end) {
              allErrors.push(
                `Special hours ${index + 1}, Time slot ${
                  slotIndex + 1
                }: Start and end times are required`
              );
            } else if (slot.start >= slot.end) {
              allErrors.push(
                `Special hours ${index + 1}, Time slot ${
                  slotIndex + 1
                }: Start time must be before end time`
              );
            }
          });
        }
      }
    });

    return allErrors;
  };

  // Load branches
  // Branches are now loaded by the BranchContext

  // Note: Branch data is now automatically updated in context when modified

  // Load opening hours when branch changes
  useEffect(() => {
    const loadOpeningHours = async () => {
      if (!selectedBranch) return;

      try {
        setIsLoading(true);
        const response = await openingHoursService.getOpeningHours(
          selectedBranch.id.toString()
        );
        if (response.success && response.data) {
          // Cast the response data to the correct structure
          const apiData = response.data as any;

          // Convert API response format to UI format
          const convertedHours: OpeningHoursType = {
            monday: {
              is_open: apiData.regular_hours?.monday?.is_open || false,
              time_slots:
                apiData.regular_hours?.monday?.time_slots?.map((slot: any) => ({
                  start: convertFrom24HourFormat(slot.open),
                  end: convertFrom24HourFormat(slot.close),
                  label: slot.label || "",
                })) || [],
            },
            tuesday: {
              is_open: apiData.regular_hours?.tuesday?.is_open || false,
              time_slots:
                apiData.regular_hours?.tuesday?.time_slots?.map(
                  (slot: any) => ({
                    start: convertFrom24HourFormat(slot.open),
                    end: convertFrom24HourFormat(slot.close),
                    label: slot.label || "",
                  })
                ) || [],
            },
            wednesday: {
              is_open: apiData.regular_hours?.wednesday?.is_open || false,
              time_slots:
                apiData.regular_hours?.wednesday?.time_slots?.map(
                  (slot: any) => ({
                    start: convertFrom24HourFormat(slot.open),
                    end: convertFrom24HourFormat(slot.close),
                    label: slot.label || "",
                  })
                ) || [],
            },
            thursday: {
              is_open: apiData.regular_hours?.thursday?.is_open || false,
              time_slots:
                apiData.regular_hours?.thursday?.time_slots?.map(
                  (slot: any) => ({
                    start: convertFrom24HourFormat(slot.open),
                    end: convertFrom24HourFormat(slot.close),
                    label: slot.label || "",
                  })
                ) || [],
            },
            friday: {
              is_open: apiData.regular_hours?.friday?.is_open || false,
              time_slots:
                apiData.regular_hours?.friday?.time_slots?.map((slot: any) => ({
                  start: convertFrom24HourFormat(slot.open),
                  end: convertFrom24HourFormat(slot.close),
                  label: slot.label || "",
                })) || [],
            },
            saturday: {
              is_open: apiData.regular_hours?.saturday?.is_open || false,
              time_slots:
                apiData.regular_hours?.saturday?.time_slots?.map(
                  (slot: any) => ({
                    start: convertFrom24HourFormat(slot.open),
                    end: convertFrom24HourFormat(slot.close),
                    label: slot.label || "",
                  })
                ) || [],
            },
            sunday: {
              is_open: apiData.regular_hours?.sunday?.is_open || false,
              time_slots:
                apiData.regular_hours?.sunday?.time_slots?.map((slot: any) => ({
                  start: convertFrom24HourFormat(slot.open),
                  end: convertFrom24HourFormat(slot.close),
                  label: slot.label || "",
                })) || [],
            },
          };

          console.log("API Response:", apiData);
          console.log("Converted Hours:", convertedHours);

          setOpeningHours(convertedHours);

          // Load special hours separately
          try {
            const specialHoursResponse =
              await specialHoursService.getSpecialHours(
                selectedBranch.id.toString()
              );
            if (specialHoursResponse.success && specialHoursResponse.data) {
              const convertedSpecialHours =
                specialHoursResponse.data.special_hours.map((special: any) => {
                  const timeSlots = special.time_slots
                    ? special.time_slots.map((slot: any) => ({
                        start: convertFrom24HourFormat(slot.open),
                        end: convertFrom24HourFormat(slot.close),
                        label: slot.label || "",
                      }))
                    : [];
                  
                  // Remove duplicate time slots
                  const uniqueTimeSlots = timeSlots.filter((slot: any, slotIndex: number, array: any[]) => 
                    array.findIndex(s => s.start === slot.start && s.end === slot.end) === slotIndex
                  );
                  
                  return {
                    id: special.id?.toString(),
                    date: new Date(special.date).toISOString().split("T")[0],
                    is_open: special.is_open,
                    time_slots: uniqueTimeSlots,
                    note: special.note || "",
                    isActive: true, // Always active when loaded from API
                  };
                });
              // Fix any invalid time slots in the loaded data
              const fixedSpecialHours = convertedSpecialHours.map(special => {
                if (special.time_slots && special.time_slots.length > 0) {
                  const fixedTimeSlots = special.time_slots.map((slot: any) => {
                    const startMinutes = timeToMinutes(slot.start);
                    const endMinutes = timeToMinutes(slot.end);
                    
                    if (startMinutes >= endMinutes) {
                      // Fix by adding 1 hour to the end time
                      const fixedEndMinutes = startMinutes + 60;
                      const fixedEndTime = minutesToTime(fixedEndMinutes);
                      
                      console.log(`Auto-fixed invalid time slot on load: ${slot.start} to ${slot.end} -> ${slot.start} to ${fixedEndTime}`);
                      
                      return {
                        ...slot,
                        end: fixedEndTime
                      };
                    }
                    
                    return slot;
                  });
                  
                  return {
                    ...special,
                    time_slots: fixedTimeSlots
                  };
                }
                
                return special;
              });
              
              setSpecialHours(fixedSpecialHours);
            }
          } catch (specialHoursError) {
            console.warn("Failed to load special hours:", specialHoursError);
            // Continue without special hours
          }
        }
      } catch (err) {
        console.warn("Failed to load opening hours:", err);
        // Create default opening hours structure
        const defaultHours: OpeningHoursType = {
          monday: { is_open: false, time_slots: [] },
          tuesday: { is_open: false, time_slots: [] },
          wednesday: { is_open: false, time_slots: [] },
          thursday: { is_open: false, time_slots: [] },
          friday: { is_open: false, time_slots: [] },
          saturday: { is_open: false, time_slots: [] },
          sunday: { is_open: false, time_slots: [] },
        };
        setOpeningHours(defaultHours);
      } finally {
        setIsLoading(false);
      }
    };

    loadOpeningHours();
  }, [selectedBranch]);

  // Debug logging for openingHours state changes
  useEffect(() => {
    console.log("OpeningHoursPage - openingHours state changed:", openingHours);
  }, [openingHours]);

  // Auto-fix invalid time slots whenever special hours change
  useEffect(() => {
    if (specialHours.length > 0) {
      const needsFixing = specialHours.some(special => 
        special.time_slots?.some(slot => {
          const startMinutes = timeToMinutes(slot.start);
          const endMinutes = timeToMinutes(slot.end);
          return startMinutes >= endMinutes;
        })
      );

      if (needsFixing) {
        console.log('Auto-fixing invalid time slots on render...');
        const fixedSpecialHours = specialHours.map(special => {
          if (special.time_slots && special.time_slots.length > 0) {
            const fixedTimeSlots = special.time_slots.map((slot: any) => {
              const startMinutes = timeToMinutes(slot.start);
              const endMinutes = timeToMinutes(slot.end);
              
              if (startMinutes >= endMinutes) {
                const fixedEndMinutes = startMinutes + 60;
                const fixedEndTime = minutesToTime(fixedEndMinutes);
                
                console.log(`Auto-fixed invalid time slot on render: ${slot.start} to ${slot.end} -> ${slot.start} to ${fixedEndTime}`);
                
                return {
                  ...slot,
                  end: fixedEndTime
                };
              }
              
              return slot;
            });
            
            // Sort by start time
            const sortedTimeSlots = fixedTimeSlots.sort((a: any, b: any) => {
              const startA = timeToMinutes(a.start);
              const startB = timeToMinutes(b.start);
              return startA - startB;
            });
            
            return {
              ...special,
              time_slots: sortedTimeSlots
            };
          }
          
          return special;
        });
        
        setSpecialHours(fixedSpecialHours);
      }
    }
  }, [specialHours]);

  const handleSaveOpeningHours = async () => {
    if (!selectedBranch) return;

    // Validate all opening hours before saving
    const validationErrors = validateAllOpeningHours();
    if (validationErrors.length > 0) {
      toast.error("Please fix the following errors before saving:", {
        description: validationErrors.join("\n"),
      });
      return;
    }

    try {
      setIsSaving(true);
      // Convert UI hours to API format
      const convertDayHours = (dayHours: any) => {
        const isOpen = dayHours?.is_open || false;
        const timeSlots = dayHours?.time_slots || [];

        return {
          is_open: isOpen,
          time_slots:
            isOpen && timeSlots.length > 0
              ? timeSlots.map((slot: any) => ({
                  open: convertTo24HourFormat(slot.start),
                  close: convertTo24HourFormat(slot.end),
                  label: slot.label || "",
                }))
              : [],
        };
      };

      const apiHours = {
        monday: convertDayHours(openingHours.monday),
        tuesday: convertDayHours(openingHours.tuesday),
        wednesday: convertDayHours(openingHours.wednesday),
        thursday: convertDayHours(openingHours.thursday),
        friday: convertDayHours(openingHours.friday),
        saturday: convertDayHours(openingHours.saturday),
        sunday: convertDayHours(openingHours.sunday),
      };

      console.log("Sending API hours:", apiHours);

      // Save regular opening hours
      const response = await openingHoursService.updateOpeningHours(
        selectedBranch.id.toString(),
        apiHours
      );

      if (!response.success) {
        toast.error(response.message || "Failed to save opening hours");
        return;
              }

        // Save special hours
        console.log('All special hours before filtering:', specialHours);
        const activeSpecialHours = specialHours.filter((special) => special.isActive);
        console.log('Active special hours after filtering:', activeSpecialHours);
        
        const specialHoursPromises = activeSpecialHours
          .map(async (special) => {
            console.log('Processing special hours:', {
              id: special.id,
              date: special.date,
              is_open: special.is_open,
              isActive: special.isActive,
              time_slots: special.time_slots
            });
            
            const specialHoursData = {
              date: special.date,
              is_open: special.is_open,
              time_slots: special.time_slots.map((slot) => ({
                open: convertTo24HourFormat(slot.start),
                close: convertTo24HourFormat(slot.end),
                label: slot.label || "",
              })),
              note: special.note,
            };

            if (special.id) {
              console.log('Updating existing special hours with ID:', special.id);
              // Update existing special hours
              return specialHoursService.updateSpecialHours(
                selectedBranch.id.toString(),
                special.id,
                specialHoursData
              );
            } else {
              console.log('Creating new special hours (no ID found)');
              // Try to create new special hours, but handle the case where it already exists
              try {
                return await specialHoursService.createSpecialHours(
                  selectedBranch.id.toString(),
                  specialHoursData
                );
              } catch (error: any) {
                console.log('Creation failed, checking if record already exists:', error.message);
                // If creation fails because record already exists, try to update instead
                if (error.message.includes('already exist') || error.message.includes('Time slots overlap')) {
                  console.log('Record already exists, fetching existing records...');
                  // Get existing special hours to find the ID
                  const existingSpecialHours = await specialHoursService.getSpecialHours(
                    selectedBranch.id.toString()
                  );
                  
                  console.log('Existing special hours response:', existingSpecialHours);
                  
                  if (existingSpecialHours.success && existingSpecialHours.data) {
                    const existingRecord = existingSpecialHours.data.special_hours.find(
                      (existing: any) => existing.date === special.date
                    );
                    
                    console.log('Found existing record:', existingRecord);
                    
                    if (existingRecord && existingRecord.id) {
                      console.log('Updating existing record with ID:', existingRecord.id);
                      // Update the existing record
                      return specialHoursService.updateSpecialHours(
                        selectedBranch.id.toString(),
                        existingRecord.id,
                        specialHoursData
                      );
                    }
                  }
                }
                // Re-throw the error if we can't handle it
                console.log('Re-throwing error:', error.message);
                throw error;
              }
            }
          });

      // Wait for all special hours to be saved
      if (specialHoursPromises.length > 0) {
        try {
          await Promise.all(specialHoursPromises);
        } catch (error: any) {
          console.error("Error saving special hours:", error);
          toast.error(
            "Opening hours saved, but some special hours failed to save: " +
              error.message
          );
          return;
        }
      }

      toast.success("Opening hours and special hours saved successfully");
    } catch (err: any) {
      console.error("Error saving opening hours:", err);
      // Show the actual error message from the API
      const errorMessage = err?.message || "Failed to save opening hours";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Bulk actions
  const copyFromDay = (sourceDay: keyof OpeningHoursType) => {
    const sourceHours = openingHours[sourceDay];
    if (!sourceHours) return;

    const updatedHours = { ...openingHours };
    (Object.keys(updatedHours) as Array<keyof OpeningHoursType>).forEach(
      (day) => {
        if (day !== sourceDay) {
          (updatedHours as any)[day] = { ...(sourceHours as any) };
        }
      }
    );
    setOpeningHours(updatedHours);
    toast.success(`Copied hours from ${sourceDay} to all other days`);
  };

  const setAllToClosed = () => {
    const updatedHours = { ...openingHours };
    (Object.keys(updatedHours) as Array<keyof OpeningHoursType>).forEach(
      (day) => {
        (updatedHours as any)[day] = { is_open: false, time_slots: [] };
      }
    );
    setOpeningHours(updatedHours);
    toast.success("All days set to closed");
  };

  const setAllToOpen = () => {
    const updatedHours = { ...openingHours };
    (Object.keys(updatedHours) as Array<keyof OpeningHoursType>).forEach(
      (day) => {
        (updatedHours as any)[day] = {
          is_open: true,
          time_slots: [
            { start: "9:00 AM", end: "5:00 PM", label: "Business Hours" },
          ],
        };
      }
    );
    setOpeningHours(updatedHours);
    toast.success("All days set to open (9:00 AM - 5:00 PM)");
  };

  // Special hours functions
  const addSpecialHours = () => {
    // Find the highest date in existing special hours
    let nextDate = new Date();
    
    if (specialHours.length > 0) {
      const existingDates = specialHours
        .map(special => new Date(special.date))
        .filter(date => !isNaN(date.getTime()))
        .sort((a, b) => b.getTime() - a.getTime()); // Sort descending
      
      if (existingDates.length > 0) {
        // Get the latest date and add 1 day
        const latestDate = existingDates[0];
        nextDate = new Date(latestDate);
        nextDate.setDate(latestDate.getDate() + 1);
      }
    }
    
    const newSpecial: SpecialHours = {
      date: nextDate.toISOString().split("T")[0],
      is_open: false,
      time_slots: [],
      note: "",
      isActive: true,
    };
    setSpecialHours([...specialHours, newSpecial]);
  };

  const updateSpecialHours = (
    index: number,
    updates: Partial<SpecialHours>
  ) => {
    const updated = [...specialHours];
    updated[index] = { ...updated[index], ...updates };
    
    // Remove duplicate time slots and fix invalid time slots
    if (updated[index].time_slots) {
      const uniqueSlots = updated[index].time_slots.filter((slot, slotIndex, array) => 
        array.findIndex(s => s.start === slot.start && s.end === slot.end) === slotIndex
      );
      
      // Fix invalid time slots (where start >= end) and sort by start time
      const fixedSlots = uniqueSlots.map(slot => {
        const startMinutes = timeToMinutes(slot.start);
        const endMinutes = timeToMinutes(slot.end);
        
        if (startMinutes >= endMinutes) {
          // Fix by adding 1 hour to the end time
          const fixedEndMinutes = startMinutes + 60;
          const fixedEndTime = minutesToTime(fixedEndMinutes);
          
          console.log(`Fixed invalid time slot: ${slot.start} to ${slot.end} -> ${slot.start} to ${fixedEndTime}`);
          
          return {
            ...slot,
            end: fixedEndTime
          };
        }
        
        return slot;
      });
      
      // Sort time slots by start time to ensure proper order
      const sortedSlots = fixedSlots.sort((a, b) => {
        const startA = timeToMinutes(a.start);
        const startB = timeToMinutes(b.start);
        return startA - startB;
      });
      
      // Check if sorting changed anything
      if (JSON.stringify(sortedSlots) !== JSON.stringify(fixedSlots)) {
        console.log('Re-sorted time slots to fix ordering');
      }
      
      updated[index].time_slots = sortedSlots;
    }
    
    setSpecialHours(updated);
  };

  const removeSpecialHours = (index: number) => {
    setSpecialHours(specialHours.filter((_, i) => i !== index));
  };

  // Time slot functions
  const addTimeSlot = (day: keyof OpeningHoursType) => {
    const currentSlots = (openingHours[day] as any)?.time_slots || [];

    // Calculate the next available start time
    let nextStartTime = "9:00 AM";
    if (currentSlots.length > 0) {
      // Find the latest end time from existing slots
      let latestEndTime = "12:00 AM";
      currentSlots.forEach((slot: any) => {
        if (slot?.end) {
          const slotEndMinutes = timeToMinutes(slot.end);
          const latestEndMinutes = timeToMinutes(latestEndTime);
          if (slotEndMinutes > latestEndMinutes) {
            latestEndTime = slot.end;
          }
        }
      });
      // Set next start time to 30 minutes after the latest end time
      nextStartTime = getNextAvailableTime(latestEndTime);
    }

    // Calculate a reasonable end time (2 hours after start)
    const startMinutes = timeToMinutes(nextStartTime);
    const endMinutes = startMinutes + 120; // Add 2 hours
    const endTimeIndex = Math.min(endMinutes / 30, timeOptions.length - 1);
    const nextEndTime = timeOptions[Math.floor(endTimeIndex)];

    const newSlot: TimeSlot = {
      start: nextStartTime,
      end: nextEndTime,
      label: "",
    };

    setOpeningHours((prev) => ({
      ...prev,
      [day]: { ...(prev[day] as any), time_slots: [...currentSlots, newSlot] },
    }));
  };

  const updateTimeSlot = (
    day: keyof OpeningHoursType,
    slotIndex: number,
    updates: Partial<TimeSlot>
  ) => {
    const currentSlots = (openingHours[day] as any)?.time_slots || [];
    const updatedSlots = currentSlots.map((slot: any, index: any) =>
      index === slotIndex ? { ...slot, ...updates } : slot
    );
    setOpeningHours((prev) => ({
      ...prev,
      [day]: { ...(prev[day] as any), time_slots: updatedSlots },
    }));
  };

  const removeTimeSlot = (day: keyof OpeningHoursType, slotIndex: number) => {
    const currentSlots = (openingHours[day] as any)?.time_slots || [];
    const updatedSlots = currentSlots.filter(
      (_: any, index: any) => index !== slotIndex
    );
    setOpeningHours((prev) => ({
      ...prev,
      [day]: { ...(prev[day] as any), time_slots: updatedSlots },
    }));
  };

  const toggleDayOpen = (day: keyof OpeningHoursType) => {
    setOpeningHours((prev) => ({
      ...prev,
      [day]: { ...(prev[day] as any), is_open: !(prev[day] as any)?.is_open },
    }));
  };

  if (isLoading && branches.length === 0) {
    return (
      <LoadingPlaceholder
        icon={Building2}
        title="Loading Opening Hours"
        subtitle="Please wait while we fetch your branch information"
        size="lg"
      />
    );
  }

  if (branches.length === 0) {
    return (
      <EmptyPlaceholder
        icon={Building2}
        title="No Branches Found"
        subtitle="You need to create a branch before you can set opening hours. Branches help organize your business locations."
        actionText="Create Your First Branch"
        onAction={() => (window.location.href = "/settings/branches")}
        size="lg"
      />
    );
  }

  const daysOfWeek = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ];

  const timeOptions = [
    "12:00 AM",
    "12:30 AM",
    "1:00 AM",
    "1:30 AM",
    "2:00 AM",
    "2:30 AM",
    "3:00 AM",
    "3:30 AM",
    "4:00 AM",
    "4:30 AM",
    "5:00 AM",
    "5:30 AM",
    "6:00 AM",
    "6:30 AM",
    "7:00 AM",
    "7:30 AM",
    "8:00 AM",
    "8:30 AM",
    "9:00 AM",
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "1:00 PM",
    "1:30 PM",
    "2:00 PM",
    "2:30 PM",
    "3:00 PM",
    "3:30 PM",
    "4:00 PM",
    "4:30 PM",
    "5:00 PM",
    "5:30 PM",
    "6:00 PM",
    "6:30 PM",
    "7:00 PM",
    "7:30 PM",
    "8:00 PM",
    "8:30 PM",
    "9:00 PM",
    "9:30 PM",
    "10:00 PM",
    "10:30 PM",
    "11:00 PM",
    "11:30 PM",
  ];

  // Helper function to get the next available time after a given time
  const getNextAvailableTime = (time: string): string => {
    const timeIndex = timeOptions.indexOf(time);
    if (timeIndex === -1 || timeIndex >= timeOptions.length - 1) {
      return timeOptions[timeOptions.length - 1]; // Return last available time
    }
    return timeOptions[timeIndex + 1];
  };

  // Helper function to get filtered start time options for a specific slot
  const getFilteredStartTimeOptions = (
    day: keyof OpeningHoursType,
    slotIndex: number
  ): string[] => {
    const dayHours = openingHours[day] as any;
    if (!dayHours?.time_slots || slotIndex === 0) {
      return timeOptions; // First slot can use any time
    }

    // Find the latest end time from previous slots
    let latestEndTime = "12:00 AM";
    for (let i = 0; i < slotIndex; i++) {
      const prevSlot = dayHours.time_slots[i];
      if (prevSlot?.end) {
        const prevEndMinutes = timeToMinutes(prevSlot.end);
        const latestEndMinutes = timeToMinutes(latestEndTime);
        if (prevEndMinutes > latestEndMinutes) {
          latestEndTime = prevSlot.end;
        }
      }
    }

    // Filter options to only show times after the latest end time
    const latestEndMinutes = timeToMinutes(latestEndTime);
    return timeOptions.filter((time) => {
      const timeMinutes = timeToMinutes(time);
      return timeMinutes > latestEndMinutes;
    });
  };

  // Helper function to get filtered end time options for a specific slot
  const getFilteredEndTimeOptions = (
    day: keyof OpeningHoursType,
    slotIndex: number,
    startTime: string
  ): string[] => {
    const dayHours = openingHours[day] as any;
    if (!dayHours?.time_slots) {
      return timeOptions;
    }

    const startMinutes = timeToMinutes(startTime);

    // Filter options to only show times after the start time
    let filteredOptions = timeOptions.filter((time) => {
      const timeMinutes = timeToMinutes(time);
      return timeMinutes > startMinutes;
    });

    // If there are subsequent slots, limit end time to not overlap with next slot
    if (slotIndex < dayHours.time_slots.length - 1) {
      const nextSlot = dayHours.time_slots[slotIndex + 1];
      if (nextSlot?.start) {
        const nextStartMinutes = timeToMinutes(nextSlot.start);
        filteredOptions = filteredOptions.filter((time) => {
          const timeMinutes = timeToMinutes(time);
          return timeMinutes <= nextStartMinutes;
        });
      }
    }

    return filteredOptions;
  };

  const breadcrumbItems = [
    { label: "Settings", href: "/settings" },
    { label: "Opening Hours" },
  ];

  // Get validation errors for display
  const validationErrors = validateAllOpeningHours();

  return (
    <div className="h-[calc(100vh-3rem)] bg-gray-50 flex flex-col">
      <SettingsHeader
        title="Opening Hours"
        subtitle="Set business hours for this branch."
        breadcrumbs={breadcrumbItems}
      />

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Validation Errors Summary */}
          {validationErrors.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-red-800 flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>Please fix the following issues:</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {validationErrors.map((error, index) => (
                    <li
                      key={index}
                      className="flex items-start space-x-2 text-red-700"
                    >
                      <span className="text-red-500 mt-0.5">•</span>
                      <span className="text-sm">{error}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          {/* Branch and Timezone Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Branch
              </Label>
              <div className="relative">
                <select
                  value={selectedBranch?.id || ""}
                  onChange={(e) => handleBranchChange(e.target.value)}
                  className="w-full appearance-none border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                >
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Timezone
              </Label>
              <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex-shrink-0">
                  <Globe className="w-5 h-5 text-gray-500" />
                </div>
                <div className="flex-1">
                  <span className="text-gray-900 font-medium">
                    {selectedBranch?.timezone || "Not set"}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Timezone is set at branch level
              </p>
            </div>
          </div>

          {/* Bulk Actions */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Bulk Actions
              </CardTitle>
              <CardDescription className="text-sm text-gray-600">
                Quickly apply settings to all days of the week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        copyFromDay(e.target.value as keyof OpeningHoursType);
                      }
                    }}
                    className="appearance-none bg-purple-600 text-white pl-10 pr-10 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 font-medium text-sm hover:bg-purple-700 transition-colors border border-purple-600"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Copy from...
                    </option>
                    {daysOfWeek.map((day) => (
                      <option key={day.key} value={day.key}>
                        Copy from {day.label}
                      </option>
                    ))}
                  </select>
                  <Copy className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
                </div>

                <Button
                  variant="outline"
                  onClick={setAllToClosed}
                  className="flex items-center space-x-2 px-4 py-2.5 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 focus:ring-red-500"
                >
                  <X className="w-4 h-4" />
                  <span className="font-medium">Set all to Closed</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={setAllToOpen}
                  className="flex items-center space-x-2 px-4 py-2.5 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 focus:ring-green-500"
                >
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">
                    Set all to Open (9:00 AM - 5:00 PM)
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Regular Hours */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">
                Regular Hours
              </CardTitle>
              <CardDescription className="text-sm text-gray-600">
                Set business hours for each day of the week
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {daysOfWeek.map((day) => {
                const dayHours =
                  openingHours[day.key as keyof OpeningHoursType];
                return (
                  <div
                    key={day.key}
                    className="border-b border-gray-100 pb-6 last:border-b-0"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Switch
                          checked={(dayHours as any)?.is_open || false}
                          onCheckedChange={() =>
                            toggleDayOpen(day.key as keyof OpeningHoursType)
                          }
                        />
                        <div className="flex items-center space-x-2">
                          <Label className="text-base font-medium text-gray-900">
                            {(dayHours as any)?.is_open ? "Open" : "Closed"}
                          </Label>
                          {(dayHours as any)?.is_open &&
                            (!(dayHours as any)?.time_slots ||
                              (dayHours as any)?.time_slots?.length === 0) && (
                              <div className="flex items-center space-x-1 text-amber-600">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-xs">No time slots</span>
                              </div>
                            )}
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                        {day.label}
                      </span>
                    </div>

                    {(dayHours as any)?.is_open && (
                      <div className="ml-8 space-y-3">
                        {(dayHours as any)?.time_slots.map(
                          (slot: any, slotIndex: any) => {
                            const slotError = validateTimeSlot(
                              slot.start,
                              slot.end
                            );
                            const hasError = !!slotError;

                            // Get filtered time options for this slot
                            const filteredStartOptions =
                              getFilteredStartTimeOptions(
                                day.key as keyof OpeningHoursType,
                                slotIndex
                              );
                            const filteredEndOptions =
                              getFilteredEndTimeOptions(
                                day.key as keyof OpeningHoursType,
                                slotIndex,
                                slot.start
                              );

                            return (
                              <div
                                key={slotIndex}
                                className={`flex items-center space-x-3 p-3 rounded-lg border ${
                                  hasError
                                    ? "bg-red-50 border-red-200"
                                    : "bg-gray-50 border-gray-200"
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  <Clock
                                    className={`w-4 h-4 ${
                                      hasError
                                        ? "text-red-500"
                                        : "text-gray-500"
                                    }`}
                                  />
                                  <select
                                    value={slot.start}
                                    onChange={(e) =>
                                      updateTimeSlot(
                                        day.key as keyof OpeningHoursType,
                                        slotIndex,
                                        { start: e.target.value }
                                      )
                                    }
                                    className={`border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 bg-white ${
                                      hasError
                                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                    }`}
                                  >
                                    {filteredStartOptions.map((time) => (
                                      <option key={time} value={time}>
                                        {time}
                                      </option>
                                    ))}
                                  </select>
                                  <span
                                    className={`font-medium ${
                                      hasError
                                        ? "text-red-500"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    to
                                  </span>
                                  <select
                                    value={slot.end}
                                    onChange={(e) =>
                                      updateTimeSlot(
                                        day.key as keyof OpeningHoursType,
                                        slotIndex,
                                        { end: e.target.value }
                                      )
                                    }
                                    className={`border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 bg-white ${
                                      hasError
                                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                    }`}
                                  >
                                    {filteredEndOptions.map((time) => (
                                      <option key={time} value={time}>
                                        {time}
                                      </option>
                                    ))}
                                  </select>
                                  {hasError && (
                                    <div className="flex items-center space-x-1 text-red-600">
                                      <AlertCircle className="w-4 h-4" />
                                      <span className="text-xs">
                                        {slotError}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <Input
                                  value={slot.label || ""}
                                  onChange={(e) =>
                                    updateTimeSlot(
                                      day.key as keyof OpeningHoursType,
                                      slotIndex,
                                      { label: e.target.value }
                                    )
                                  }
                                  placeholder="Label (optional)"
                                  className="w-40 text-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                />

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    removeTimeSlot(
                                      day.key as keyof OpeningHoursType,
                                      slotIndex
                                    )
                                  }
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            );
                          }
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            addTimeSlot(day.key as keyof OpeningHoursType)
                          }
                          className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300 hover:bg-blue-50 px-4 py-2"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add time interval
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Special Hours / Exceptions */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setIsSpecialHoursExpanded(!isSpecialHoursExpanded)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Special Hours / Exceptions
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    Use for public holidays, seasonal hours (optional)
                  </CardDescription>
                </div>
                {isSpecialHoursExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </div>
            </CardHeader>

            {isSpecialHoursExpanded && (
              <CardContent className="space-y-4">
                {specialHours.map((special, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <Input
                          type="date"
                          value={special.date}
                          onChange={(e) =>
                            updateSpecialHours(index, { date: e.target.value })
                          }
                          className="w-40"
                        />
                        <Switch
                          checked={special.is_open}
                          onCheckedChange={(checked) =>
                            updateSpecialHours(index, { is_open: checked })
                          }
                        />
                        <span className="text-sm font-medium">
                          {special.is_open ? "Open" : "Closed"}
                        </span>
                        {special.is_open &&
                          (!special.time_slots ||
                            special.time_slots.length === 0) && (
                            // <span className="text-xs text-red-600 font-medium">
                            //   (No time slots)
                            // </span>
                            <div className="flex items-center space-x-1 text-amber-600">
                              <AlertCircle className="w-4 h-4" />
                              <span className="text-xs">No time slots</span>
                            </div>
                          )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSpecialHours(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {special.is_open && (
                      <div className="ml-8 space-y-3">
                        {special.time_slots.map((slot, slotIndex) => {
                          // Get filtered time options for special hours
                          const filteredStartOptions =
                            slotIndex === 0
                              ? timeOptions
                              : timeOptions.filter((time) => {
                                  const timeMinutes = timeToMinutes(time);
                                  const prevEndMinutes = timeToMinutes(
                                    special.time_slots[slotIndex - 1]?.end ||
                                      "12:00 AM"
                                  );
                                  return timeMinutes > prevEndMinutes;
                                });

                          const filteredEndOptions = timeOptions.filter(
                            (time) => {
                              const timeMinutes = timeToMinutes(time);
                              const startMinutes = timeToMinutes(slot.start);
                              return timeMinutes > startMinutes;
                            }
                          );

                          return (
                            <div
                              key={slotIndex}
                              className="flex items-center space-x-3"
                            >
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <select
                                  value={slot.start}
                                  onChange={(e) => {
                                    const updatedSlots = [
                                      ...special.time_slots,
                                    ];
                                    updatedSlots[slotIndex] = {
                                      ...slot,
                                      start: e.target.value,
                                    };
                                    updateSpecialHours(index, {
                                      time_slots: updatedSlots,
                                    });
                                  }}
                                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                                >
                                  {filteredStartOptions.map((time) => (
                                    <option key={time} value={time}>
                                      {time}
                                    </option>
                                  ))}
                                </select>
                                <span className="text-gray-500">to</span>
                                <select
                                  value={slot.end}
                                  onChange={(e) => {
                                    const updatedSlots = [
                                      ...special.time_slots,
                                    ];
                                    updatedSlots[slotIndex] = {
                                      ...slot,
                                      end: e.target.value,
                                    };
                                    updateSpecialHours(index, {
                                      time_slots: updatedSlots,
                                    });
                                  }}
                                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                                >
                                  {filteredEndOptions.map((time) => (
                                    <option key={time} value={time}>
                                      {time}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <Input
                                value={slot.label || ""}
                                onChange={(e) => {
                                  const updatedSlots = [...special.time_slots];
                                  updatedSlots[slotIndex] = {
                                    ...slot,
                                    label: e.target.value,
                                  };
                                  updateSpecialHours(index, {
                                    time_slots: updatedSlots,
                                  });
                                }}
                                placeholder="Label (optional)"
                                className="w-32 text-sm"
                              />

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const updatedSlots =
                                    special.time_slots.filter(
                                      (_, i) => i !== slotIndex
                                    );
                                  updateSpecialHours(index, {
                                    time_slots: updatedSlots,
                                  });
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          );
                        })}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const existingSlots = special.time_slots;
                            let newStartTime = "10:00 AM";
                            let newEndTime = "6:00 PM";
                            
                            // If there are existing slots, calculate next logical time slot
                            if (existingSlots.length > 0) {
                              // Get the last slot's end time
                              const lastSlot = existingSlots[existingSlots.length - 1];
                              const lastEndTime = lastSlot.end;
                              
                              // Convert to minutes for calculation
                              const lastEndMinutes = timeToMinutes(lastEndTime);
                              
                              // Add 30 minutes to the last end time for the new start time
                              const newStartMinutes = lastEndMinutes + 30;
                              newStartTime = minutesToTime(newStartMinutes);
                              
                              // Add 1 hour to the new start time for the end time
                              let newEndMinutes = newStartMinutes + 60;
                              newEndTime = minutesToTime(newEndMinutes);
                              
                              // Safety check: ensure end time is after start time
                              if (newEndMinutes <= newStartMinutes) {
                                newEndMinutes = newStartMinutes + 60;
                                newEndTime = minutesToTime(newEndMinutes);
                              }
                              
                              // If the new end time goes beyond 11:30 PM, don't add the slot
                              const maxEndMinutes = timeToMinutes("11:30 PM");
                              if (newEndMinutes > maxEndMinutes) {
                                console.log('Cannot add more time slots - would exceed 11:30 PM limit');
                                // Don't add the slot, return early
                                return;
                              }
                              
                              console.log('Smart time slot calculation:', {
                                lastEndTime,
                                newStartTime,
                                newEndTime,
                                lastEndMinutes,
                                newStartMinutes,
                                newEndMinutes
                              });
                            }
                            
                            const updatedSlots = [
                              ...special.time_slots,
                              { start: newStartTime, end: newEndTime, label: "" },
                            ];
                            updateSpecialHours(index, {
                              time_slots: updatedSlots,
                            });
                          }}
                          className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300 hover:bg-blue-50 px-4 py-2"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add time interval
                        </Button>
                      </div>
                    )}

                    <Input
                      value={special.note}
                      onChange={(e) =>
                        updateSpecialHours(index, { note: e.target.value })
                      }
                      placeholder="Note (e.g., Christmas Day, New Year's Eve)"
                      className="w-full"
                    />
                  </div>
                ))}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={addSpecialHours}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add special hours
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      console.log('Manual fix time slots triggered...');
                      const fixedSpecialHours = specialHours.map(special => {
                        if (special.time_slots && special.time_slots.length > 0) {
                          const fixedTimeSlots = special.time_slots.map((slot: any) => {
                            const startMinutes = timeToMinutes(slot.start);
                            const endMinutes = timeToMinutes(slot.end);
                            
                            if (startMinutes >= endMinutes) {
                              const fixedEndMinutes = startMinutes + 60;
                              const fixedEndTime = minutesToTime(fixedEndMinutes);
                              
                              console.log(`Manual fix: ${slot.start} to ${slot.end} -> ${slot.start} to ${fixedEndTime}`);
                              
                              return {
                                ...slot,
                                end: fixedEndTime
                              };
                            }
                            
                            return slot;
                          });
                          
                          const sortedTimeSlots = fixedTimeSlots.sort((a: any, b: any) => {
                            const startA = timeToMinutes(a.start);
                            const startB = timeToMinutes(b.start);
                            return startA - startB;
                          });
                          
                          return {
                            ...special,
                            time_slots: sortedTimeSlots
                          };
                        }
                        
                        return special;
                      });
                      
                      setSpecialHours(fixedSpecialHours);
                      toast.success("Time slots fixed automatically!");
                    }}
                    className="text-green-600 hover:text-green-700"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Fix Time Slots
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <Button
              onClick={handleSaveOpeningHours}
              disabled={validationErrors.length > 0 || isSaving}
              className={`px-6 py-2.5 font-medium ${
                validationErrors.length > 0 || isSaving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSaving ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Opening Hours
                  {validationErrors.length > 0 && (
                    <span className="ml-2 text-xs">
                      ({validationErrors.length} errors)
                    </span>
                  )}
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OpeningHoursPage;
