import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, Search, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { timezoneService, Timezone } from '@/services/timezoneService';

interface TimezoneSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  showSearch?: boolean;
  showCurrentTime?: boolean;
  showPopularTimezones?: boolean;
}

const TimezoneSelect: React.FC<TimezoneSelectProps> = ({
  value,
  onValueChange,
  placeholder = "Select timezone...",
  label,
  required = false,
  disabled = false,
  className,
  showSearch = true,
  showCurrentTime = false,
  showPopularTimezones = false,
}) => {
  const [open, setOpen] = useState(false);
  const [timezones, setTimezones] = useState<Timezone[]>([]);
  const [groupedTimezones, setGroupedTimezones] = useState<{ [region: string]: Timezone[] }>({});
  const [popularTimezones, setPopularTimezones] = useState<Timezone[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTimezone, setSelectedTimezone] = useState<Timezone | null>(null);

  useEffect(() => {
    loadTimezones();
  }, []);

  useEffect(() => {
    if (value && timezones.length > 0) {
      const tz = timezones.find(t => t.value === value);
      setSelectedTimezone(tz || null);
    }
  }, [value, timezones]);

  const loadTimezones = async () => {
    setLoading(true);
    try {
      const tzData = await timezoneService.fetchTimezones();
      setTimezones(tzData);
      
      const grouped = await timezoneService.getTimezonesByRegion();
      setGroupedTimezones(grouped);
      
      if (showPopularTimezones) {
        const popular = await timezoneService.getPopularTimezones();
        setPopularTimezones(popular);
      }
    } catch (error) {
      console.error('Failed to load timezones:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTimezones = searchQuery
    ? timezones.filter(tz =>
        tz.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tz.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tz.region.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : timezones;

  const handleSelect = (timezone: Timezone) => {
    setSelectedTimezone(timezone);
    onValueChange(timezone.value);
    setOpen(false);
    setSearchQuery('');
  };

  const getCurrentTime = (timezone: string) => {
    if (!showCurrentTime) return null;
    try {
      return timezoneService.getCurrentTimeInTimezone(timezone);
    } catch {
      return null;
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <Label className="text-sm font-medium mb-2 block">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground"
          )}
          onClick={() => setOpen(!open)}
          disabled={disabled || loading}
        >
          {selectedTimezone ? (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="truncate">{selectedTimezone.label}</span>
              <span className="text-xs text-muted-foreground ml-2">
                {selectedTimezone.offset}
              </span>
            </div>
          ) : (
            <span>{loading ? "Loading timezones..." : placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
        
        {open && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-96 overflow-hidden">
            {showSearch && (
              <div className="p-3 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search timezones..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}
            
            <div className="max-h-80 overflow-y-auto">
              {filteredTimezones.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No timezones found
                </div>
              ) : (
                <div>
                  {/* Popular Timezones Section */}
                  {showPopularTimezones && popularTimezones.length > 0 && (
                    <div className="mb-4">
                      <div className="px-3 py-2 text-xs font-semibold text-blue-600 bg-blue-50 uppercase tracking-wide border-b border-blue-100">
                        Popular Timezones
                      </div>
                      {popularTimezones.map((timezone) => {
                        const currentTime = getCurrentTime(timezone.value);
                        const isSelected = value === timezone.value;
                        
                        return (
                          <div
                            key={timezone.value}
                            className={cn(
                              "flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-blue-50",
                              isSelected && "bg-blue-100 text-blue-700"
                            )}
                            onClick={() => handleSelect(timezone)}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium truncate">
                                  {timezone.label}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {timezone.offset}
                                </span>
                              </div>
                              {currentTime && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Current: {currentTime}
                                </div>
                              )}
                            </div>
                            {isSelected && (
                              <Check className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* All Timezones by Region */}
                  {Object.entries(groupedTimezones).map(([region, regionTimezones]) => {
                    const regionFiltered = regionTimezones.filter(tz =>
                      filteredTimezones.some(ft => ft.value === tz.value)
                    );
                    
                    if (regionFiltered.length === 0) return null;
                    
                    return (
                      <div key={region}>
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 uppercase tracking-wide">
                          {region}
                        </div>
                        {regionFiltered.map((timezone) => {
                          const currentTime = getCurrentTime(timezone.value);
                          const isSelected = value === timezone.value;
                          
                          return (
                            <div
                              key={timezone.value}
                              className={cn(
                                "flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50",
                                isSelected && "bg-blue-50 text-blue-600"
                              )}
                              onClick={() => handleSelect(timezone)}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium truncate">
                                    {timezone.label.split(' (')[0]}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {timezone.offset}
                                  </span>
                                </div>
                                {currentTime && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    Current: {currentTime}
                                  </div>
                                )}
                              </div>
                              {isSelected && (
                                <Check className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimezoneSelect;
