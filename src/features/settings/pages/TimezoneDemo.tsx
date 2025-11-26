import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Globe, Clock, Search, Download, RefreshCw } from 'lucide-react';
import TimezoneSelect from '@/components/ui/TimezoneSelect';
import { timezoneService, Timezone } from '@/services/timezoneService';
import { toast } from 'sonner';

const TimezoneDemo: React.FC = () => {
  const [timezones, setTimezones] = useState<Timezone[]>([]);
  const [groupedTimezones, setGroupedTimezones] = useState<{ [region: string]: Timezone[] }>({});
  const [selectedTimezone, setSelectedTimezone] = useState<string>('UTC');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    loadTimezones();
  }, []);

  useEffect(() => {
    if (selectedTimezone) {
      updateCurrentTime();
      const interval = setInterval(updateCurrentTime, 1000);
      return () => clearInterval(interval);
    }
  }, [selectedTimezone]);

  const loadTimezones = async () => {
    setLoading(true);
    try {
      const tzData = await timezoneService.fetchTimezones();
      setTimezones(tzData);
      
      const grouped = await timezoneService.getTimezonesByRegion();
      setGroupedTimezones(grouped);
      
      toast.success(`Loaded ${tzData.length} timezones from API`);
    } catch (error) {
      console.error('Failed to load timezones:', error);
      toast.error('Failed to load timezones, using fallback data');
    } finally {
      setLoading(false);
    }
  };

  const updateCurrentTime = () => {
    try {
      const time = timezoneService.getCurrentTimeInTimezone(selectedTimezone);
      setCurrentTime(time);
    } catch (error) {
      setCurrentTime('Error getting time');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setTimezones(await timezoneService.fetchTimezones());
      return;
    }

    try {
      const results = await timezoneService.searchTimezones(searchQuery);
      setTimezones(results);
      toast.success(`Found ${results.length} timezones matching "${searchQuery}"`);
    } catch (error) {
      toast.error('Search failed');
    }
  };

  const exportTimezones = () => {
    const dataStr = JSON.stringify(timezones, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `timezones-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Timezone data exported successfully');
  };

  const filteredTimezones = searchQuery
    ? timezones.filter(tz =>
        tz.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tz.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tz.region.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : timezones;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Timezone API Demo</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Explore the comprehensive timezone database with real-time data from the World Time API. 
          Search, filter, and view current times across different regions.
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Timezone Controls
          </CardTitle>
          <CardDescription>
            Select timezones, search, and manage timezone data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Select Timezone</Label>
              <TimezoneSelect
                value={selectedTimezone}
                onValueChange={setSelectedTimezone}
                placeholder="Choose a timezone..."
                showCurrentTime={true}
                showPopularTimezones={true}
              />
            </div>
            
            <div>
              <Label>Current Time in Selected Timezone</Label>
              <div className="flex items-center gap-2 p-3 border border-gray-200 rounded-md bg-gray-50">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="text-lg font-mono">{currentTime}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Search Timezones</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Search by name, region, or value..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} size="sm">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-end">
              <Button onClick={loadTimezones} disabled={loading} variant="outline">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
            </div>

            <div className="flex items-end">
              <Button onClick={exportTimezones} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{timezones.length}</div>
              <div className="text-sm text-muted-foreground">Total Timezones</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Object.keys(groupedTimezones).length}
              </div>
              <div className="text-sm text-muted-foreground">Regions</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {filteredTimezones.length}
              </div>
              <div className="text-sm text-muted-foreground">Filtered Results</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {selectedTimezone ? 'Active' : 'None'}
              </div>
              <div className="text-sm text-muted-foreground">Selected Timezone</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timezone List */}
      <Card>
        <CardHeader>
          <CardTitle>Timezone Database</CardTitle>
          <CardDescription>
            Browse all available timezones organized by region
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto">
            {Object.entries(groupedTimezones).map(([region, regionTimezones]) => {
              const regionFiltered = regionTimezones.filter(tz =>
                filteredTimezones.some(ft => ft.value === tz.value)
              );
              
              if (regionFiltered.length === 0) return null;
              
              return (
                <div key={region} className="mb-6">
                  <div className="px-3 py-2 text-sm font-semibold text-gray-500 bg-gray-50 uppercase tracking-wide rounded-t-md">
                    {region} ({regionFiltered.length})
                  </div>
                  <div className="border border-gray-200 rounded-b-md">
                    {regionFiltered.map((timezone) => {
                      const isSelected = selectedTimezone === timezone.value;
                      const currentTime = timezoneService.getCurrentTimeInTimezone(timezone.value);
                      
                      return (
                        <div
                          key={timezone.value}
                          className={cn(
                            "flex items-center justify-between px-3 py-2 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50",
                            isSelected && "bg-blue-50 text-blue-600"
                          )}
                          onClick={() => setSelectedTimezone(timezone.value)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">
                                {timezone.label.split(' (')[0]}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {timezone.offset}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Current: {currentTime}
                            </div>
                          </div>
                          {isSelected && (
                            <Badge variant="default" className="text-xs">
                              Selected
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* API Information */}
      <Card>
        <CardHeader>
          <CardTitle>API Information</CardTitle>
          <CardDescription>
            Details about the timezone data source and features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Data Source</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• World Time API (worldtimeapi.org)</li>
                <li>• Free and open-source timezone database</li>
                <li>• Real-time timezone information</li>
                <li>• Automatic fallback to local data</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Features</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 400+ timezone regions worldwide</li>
                <li>• Current time in any timezone</li>
                <li>• UTC offset calculations</li>
                <li>• Search and filter capabilities</li>
                <li>• Regional grouping and organization</li>
              </ul>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-md">
            <h4 className="font-semibold text-blue-800 mb-2">Usage in Components</h4>
            <p className="text-sm text-blue-700">
              This timezone service is now integrated into the Branches component and Profile component, 
              providing a consistent and user-friendly timezone selection experience across the application.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function for conditional classes
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export default TimezoneDemo;
