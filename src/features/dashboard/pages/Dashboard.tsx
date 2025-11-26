import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, Zap, TrendingUp, User, Building2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { LogoutButton } from '@/features/auth/components/LogoutButton';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Active Services',
      value: '12',
      description: '+2 from last month',
      icon: Zap,
      color: 'text-blue-600',
    },
    {
      title: 'Total Users',
      value: '1,234',
      description: '+12% from last month',
      icon: Users,
      color: 'text-green-600',
    },
    {
      title: 'Performance Score',
      value: '98.5%',
      description: '+0.5% from last month',
      icon: TrendingUp,
      color: 'text-purple-600',
    },
    {
      title: 'Analytics Views',
      value: '45.2K',
      description: '+19% from last month',
      icon: BarChart3,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with User Info and Logout */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your ServAI dashboard. Here's an overview of your services and performance.
          </p>
        </div>
        
        {/* <div className="flex items-center space-x-4">
          {/* User Info Card */}
          {/* <Card className="w-64">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <User className="h-4 w-4 mr-2" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{user?.name || 'Unknown User'}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {user?.email || 'No email'}
              </div>
              <div className="text-xs text-muted-foreground capitalize">
                Role: {user?.role || 'Unknown'}
              </div>
              {user?.business_id && (
                <div className="text-xs text-muted-foreground">
                  Business ID: {user.business_id}
                </div>
              )}
            </CardContent>
          </Card> */}
          
          {/* Logout Button */}
          {/* <LogoutButton variant="outline" size="sm" />
        </div> */}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Service Performance</CardTitle>
            <CardDescription>
              Overview of your AI services performance over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Chart placeholder - Performance metrics will be displayed here
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates and activities in your services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Service update #{i}</p>
                    <p className="text-xs text-muted-foreground">
                      Updated {i} hour{i !== 1 ? 's' : ''} ago
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
