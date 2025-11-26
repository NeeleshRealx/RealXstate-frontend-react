import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Clock,
  Phone,
  User,
  Grid3X3,
  List,
  Eye
} from 'lucide-react';
import { Branch, OpeningHours } from '@/types/settings';
import BranchModal from './BranchModal';
import { toast } from 'sonner';

interface BranchesProps {
  branches?: Branch[];
  onSave?: (branch: Branch) => void;
  onDelete?: (branchId: string) => void;
}

type ViewMode = 'cards' | 'table';

const Branches: React.FC<BranchesProps> = ({ branches = [], onSave, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [selectedBranchForHours, setSelectedBranchForHours] = useState<Branch | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; branchId: string | null; branchName: string }>({
    isOpen: false,
    branchId: null,
    branchName: ''
  });

  const filteredBranches = branches.filter(branch => {
    const matchesSearch = branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         branch.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || branch.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleSave = async (branch: Branch) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      if (onSave) {
        await onSave(branch);
      }
      // toast.success(editingBranch ? 'Branch updated successfully!' : 'Branch added successfully!');
      setIsModalOpen(false);
      setEditingBranch(null);
    } catch (error) {
      console.error('Error saving branch:', error);
      toast.error('Failed to save branch. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setIsModalOpen(true);
    toast.info(`Editing branch: ${branch.name}`);
  };

  const handleDelete = (branchId: string, branchName: string) => {
    setDeleteConfirmation({
      isOpen: true,
      branchId,
      branchName
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation.branchId) return;
    
    try {
      onDelete?.(deleteConfirmation.branchId);
      // Don't show toast here - let the parent component handle it
    } catch (error) {
      console.error('Error deleting branch:', error);
      toast.error('Failed to delete branch. Please try again.');
    } finally {
      setDeleteConfirmation({ isOpen: false, branchId: null, branchName: '' });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ isOpen: false, branchId: null, branchName: '' });
  };

  const openAddModal = () => {
    setEditingBranch(null);
    setIsModalOpen(true);
    toast.info('Add new branch form opened');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBranch(null);
  };

  const showHoursDetailsModal = (branch: Branch) => {
    console.log('Showing hours details modal for branch:', branch);
    setSelectedBranchForHours(branch);
    setShowHoursModal(true);
  };

  const closeHoursModal = () => {
    setShowHoursModal(false);
    setSelectedBranchForHours(null);
  };

  const getOpeningHoursSummary = (branch: Branch) => {
    if (!branch.opening_hours) return 'No hours set';
    
    const openDays = Object.entries(branch.opening_hours).filter(([_, hours]) => hours.is_open).length;
    const totalDays = 7;
    
    if (openDays === 0) return 'No days open';
    if (openDays === totalDays) return 'Open all days';
    return `Open ${openDays} days`;
  };

  const getFormattedOpeningHours = (branch: Branch) => {
    if (!branch.opening_hours) return { summary: 'No hours set', details: null };
    
    console.log('Branch opening hours:', branch.opening_hours);
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Group consecutive days with same hours
    const groupedHours: Array<{ days: string[], hours: string }> = [];
    let currentGroup: string[] = [];
    let currentHours = '';
    
    days.forEach((day, index) => {
      const dayHours = branch.opening_hours?.[day];
      console.log(`Day ${day}:`, dayHours);
      
      if (!dayHours || typeof dayHours === 'string' || !dayHours.is_open) {
        // If we have a current group, save it and start new
        if (currentGroup.length > 0) {
          groupedHours.push({ days: [...currentGroup], hours: currentHours });
          currentGroup = [];
          currentHours = '';
        }
        return;
      }
      
      // Format time slots for this day
      const timeSlots = dayHours.time_slots || [];
      console.log(`Time slots for ${day}:`, timeSlots);
      
      const formattedHours = timeSlots.map((slot: any) => {
        const start = slot.open || '00:00';
        const end = slot.close || '00:00';
        return `${start}-${end}`;
      }).join(', ');
      
      console.log(`Formatted hours for ${day}:`, formattedHours);
      
      // Check if this day has the same hours as the current group
      if (formattedHours === currentHours || currentGroup.length === 0) {
        currentGroup.push(dayLabels[index]);
        currentHours = formattedHours;
      } else {
        // Save current group and start new one
        if (currentGroup.length > 0) {
          groupedHours.push({ days: [...currentGroup], hours: currentHours });
        }
        currentGroup = [dayLabels[index]];
        currentHours = formattedHours;
      }
    });
    
    // Don't forget the last group
    if (currentGroup.length > 0) {
      groupedHours.push({ days: [...currentGroup], hours: currentHours });
    }
    
    console.log('Grouped hours:', groupedHours);
    
    // Create summary and details
    const summary = groupedHours.length > 0 
      ? groupedHours.map(group => `${group.days.join('-')}: ${group.hours}`).join(', ')
      : 'No hours set';
    
    console.log('Final summary:', summary);
    
    const details = groupedHours.length > 0 ? groupedHours : null;
    
    return { summary, details };
  };

  const getOpenDaysOnly = (branch: Branch) => {
    if (!branch.opening_hours) return 'No hours set';
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Get only open days with their original positions
    const openDaysWithPositions: Array<{day: string, position: number}> = [];
    
    days.forEach((day, index) => {
      const dayHours = branch.opening_hours?.[day];
      if (dayHours && typeof dayHours !== 'string' && dayHours.is_open) {
        openDaysWithPositions.push({day: dayLabels[index], position: index});
      }
    });
    
    if (openDaysWithPositions.length === 0) return 'No days open';
    if (openDaysWithPositions.length === 7) return 'Open all days';
    
    // Group consecutive days based on original positions
    const groupedDays: string[] = [];
    let currentGroup: Array<{day: string, position: number}> = [];
    
    openDaysWithPositions.forEach((dayInfo, index) => {
      if (index === 0) {
        currentGroup = [dayInfo];
      } else {
        const prevDayPosition = openDaysWithPositions[index - 1].position;
        const currentDayPosition = dayInfo.position;
        
        // Check if days are consecutive in the original week order
        if (currentDayPosition === prevDayPosition + 1) {
          // Consecutive day
          currentGroup.push(dayInfo);
        } else {
          // Non-consecutive, save current group and start new one
          if (currentGroup.length > 0) {
            const firstDay = currentGroup[0].day;
            const lastDay = currentGroup[currentGroup.length - 1].day;
            groupedDays.push(currentGroup.length === 1 ? firstDay : `${firstDay}-${lastDay}`);
          }
          currentGroup = [dayInfo];
        }
      }
    });
    
    // Don't forget the last group
    if (currentGroup.length > 0) {
      const firstDay = currentGroup[0].day;
      const lastDay = currentGroup[currentGroup.length - 1].day;
      groupedDays.push(currentGroup.length === 1 ? firstDay : `${firstDay}-${lastDay}`);
    }
    
    return groupedDays.join(', ');
  };
  
  // const isBranchCurrentlyOpen = (branch: Branch) => {
  //   if (!branch.opening_hours) return false;
    
  //   const now = new Date();
  //   const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  //   const today = dayNames[now.getDay()] as keyof typeof branch.opening_hours;
  //   const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  //   const todayHours = branch.opening_hours?.[today];
    
  //   if (!todayHours || typeof todayHours === 'string' || !todayHours.is_open) return false;
    
  //   // Check if current time falls within any time slot
  //   return todayHours.time_slots?.some((slot: any) => {
  //     const start = slot.start || '00:00';
  //     const end = slot.end || '00:00';
  //     return currentTime >= start && currentTime <= end;
  //   }) || false;
  // };

  const getCurrentTimeInTimezone = (timezone: string) => {
    try {
      return new Date().toLocaleTimeString('en-US', { 
        timeZone: timezone, 
        timeZoneName: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid timezone';
    }
  };

  const isBranchCurrentlyOpen = (branch: Branch) => {
    if (!branch.opening_hours) return false;
    
    const now = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = dayNames[now.getDay()] as keyof typeof branch.opening_hours;
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const todayHours = branch.opening_hours?.[today];
    
    if (!todayHours || typeof todayHours === 'string' || !todayHours.is_open) return false;
    
    // Check if current time falls within any time slot
    return todayHours.time_slots?.some((slot: any) => {
      const start = slot.open || '00:00';
      const end = slot.close || '00:00';
      return currentTime >= start && currentTime <= end;
    }) || false;
  };

  

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Branches</h1>
          <p className="text-muted-foreground">
            Manage your business locations and branches
          </p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Branch
        </Button>
      </div>

      {/* Search, Filter, and View Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search branches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Branches</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex items-center gap-0 border border-gray-300 rounded-md">
              <Button
                type="button"
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="rounded-r-none "
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="rounded-l-none"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Branch Modal */}
      <BranchModal
        isOpen={isModalOpen}
        onClose={closeModal}
        branch={editingBranch}
        onSave={handleSave}
        isSubmitting={isSubmitting}
      />

      {/* Opening Hours Details Modal */}
      <Dialog open={showHoursModal} onOpenChange={setShowHoursModal}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-blue-600" />
              Opening Hours - {selectedBranchForHours?.name}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Detailed weekly schedule and current status
            </DialogDescription>
          </DialogHeader>
          
          {selectedBranchForHours && (
            <div className="space-y-5">
              {/* Current Status */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isBranchCurrentlyOpen(selectedBranchForHours) ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {isBranchCurrentlyOpen(selectedBranchForHours) ? 'Currently Open' : 'Currently Closed'}
                    </h3>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {isBranchCurrentlyOpen(selectedBranchForHours) 
                        ? 'This branch is open for business right now' 
                        : 'This branch is currently closed'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Weekly Schedule */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-3">Weekly Schedule</h3>
                <div className="grid grid-cols-1 gap-2">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                    const dayHours = selectedBranchForHours.opening_hours?.[day as keyof OpeningHours];
                    const dayLabel = day.charAt(0).toUpperCase() + day.slice(1);
                    
                    // Type guard to check if dayHours is a DayHours object
                    if (typeof dayHours === 'string' || !dayHours) {
                      return (
                        <div key={day} className="flex items-center justify-between py-2.5 px-3 rounded-md border border-gray-200 bg-gray-50">
                          <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                            <span className="text-sm font-medium text-gray-600">{dayLabel}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-gray-500 font-medium">Closed</span>
                          </div>
                        </div>
                      );
                    }
                    
                    const isOpen = dayHours.is_open;
                    const timeSlots = dayHours.time_slots || [];
                    
                    return (
                      <div key={day} className={`flex items-center justify-between py-2.5 px-3 rounded-md border ${
                        isOpen ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full ${isOpen ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <span className={`text-sm font-medium ${isOpen ? 'text-green-800' : 'text-gray-600'}`}>
                            {dayLabel}
                          </span>
                        </div>
                        <div className="text-right">
                          {isOpen ? (
                            <div className="space-y-0.5">
                              {timeSlots.map((slot: any, index: number) => (
                                <div key={index} className="text-xs font-medium text-green-700">
                                  {slot.open} - {slot.close}
                                  {slot.label && <span className="text-gray-500 ml-1.5">({slot.label})</span>}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500 font-medium">Closed</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Timezone Info */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-900">Timezone</span>
                </div>
                <p className="text-xs text-blue-700 mt-1 font-medium">
                  {selectedBranchForHours.timezone} - Current time: {getCurrentTimeInTimezone(selectedBranchForHours.timezone)}
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={closeHoursModal}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Branches List */}
      {filteredBranches.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No branches found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by adding your first branch'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <Button onClick={openAddModal}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Branch
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'cards' ? (
        /* Card View */
        <div className="grid gap-4">
          {filteredBranches.map((branch) => (
            <Card key={branch.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold">{branch.name}</h3>
                      <Badge variant={branch.status === 'active' ? 'default' : 'secondary'}>
                        {branch.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{branch.address}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span className="flex items-center gap-2">
                            {branch.timezone}
                            <span className="text-xs text-muted-foreground">
                              ({getCurrentTimeInTimezone(branch.timezone)})
                            </span>
                          </span>
                        </div>
                        
                        {branch.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span>{branch.phone}</span>
                          </div>
                        )}
                        
                        {branch.manager && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4" />
                            <span>{branch.manager}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium">Opening Hours</span>
                        </div>
                        <div className="bg-gray-50 rounded-md p-2 border border-gray-200">
                          <div className="text-xs text-gray-700 font-medium">
                            {getOpenDaysOnly(branch)}
                          </div>
                        </div>
                        {/* <Badge variant="outline" className="text-xs">
                          {getOpeningHoursSummary(branch)}
                        </Badge> */}
                        {/* <div className="flex items-center gap-2">
                        {branch.opening_hours && Object.keys(branch.opening_hours).length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 p-0 h-auto"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Schedule
                          </Button>
                        )}
                        </div> */}
                        
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(branch)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(branch.id || '', branch.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Table View */
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Timezone</TableHead>
                  <TableHead>Opening Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBranches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell className="font-medium">{branch.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{branch.address}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{branch.timezone}</span>
                        <span className="text-xs text-muted-foreground">
                          {getCurrentTimeInTimezone(branch.timezone)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        {/* Status and Open Days */}
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${isBranchCurrentlyOpen(branch) ? 'bg-green-500' : 'bg-red-500'}`} 
                               title={isBranchCurrentlyOpen(branch) ? 'Currently Open' : 'Currently Closed'} />
                          <span className={`text-xs font-medium ${isBranchCurrentlyOpen(branch) ? 'text-green-700' : 'text-red-700'}`}>
                            {isBranchCurrentlyOpen(branch) ? 'Open Now' : 'Closed'}
                          </span>
                        </div>
                        
                        {/* Open Days Display */}
                        <div className="bg-gray-50 rounded-md p-2 border border-gray-200">
                          <div className="text-xs text-gray-700 font-medium">
                            {getOpenDaysOnly(branch)}
                          </div>
                        </div>
                        
                        {/* View Details Button */}
                        {branch.opening_hours && Object.keys(branch.opening_hours).length > 0 && (
                          <Button
                            variant="ghost"
                            onClick={() => showHoursDetailsModal(branch)}
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1 h-auto text-xs w-full justify-center"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View Details
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    {/* <TableCell>
                      <div className="flex flex-col gap-1 text-sm">
                        {branch.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{branch.phone}</span>
                          </div>
                        )}
                        {branch.manager && (
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{branch.manager}</span>
                          </div>
                        )}
                      </div>
                    </TableCell> */}
                    <TableCell>
                      <Badge variant={branch.status === 'active' ? 'default' : 'secondary'}>
                        {branch.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(branch)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(branch.id || '', branch.name)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmation.isOpen} onOpenChange={(open) => {
        if (!open) {
          setDeleteConfirmation({ isOpen: false, branchId: null, branchName: '' });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the branch "{deleteConfirmation.branchName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDelete}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Branches;
