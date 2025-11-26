import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Clock, BarChart3 } from 'lucide-react';

const Analytics: React.FC = () => {
  const metrics = [
    {
      title: 'Total Requests',
      value: '45.2K',
      change: '+12.5%',
      changeType: 'positive',
      icon: BarChart3,
    },
    {
      title: 'Active Users',
      value: '2.1K',
      change: '+8.2%',
      changeType: 'positive',
      icon: Users,
    },
    {
      title: 'Response Time',
      value: '245ms',
      change: '-15.3%',
      changeType: 'positive',
      icon: Clock,
    },
    {
      title: 'Success Rate',
      value: '99.2%',
      change: '+0.8%',
      changeType: 'positive',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Comprehensive analytics and insights for your AI services
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className={`text-xs ${
                  metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change} from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Request Volume</CardTitle>
            <CardDescription>
              Daily request volume over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Chart placeholder - Request volume data will be displayed here
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Services</CardTitle>
            <CardDescription>
              Most used services by request volume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'AI Chat Assistant', requests: '12.5K', percentage: 45 },
                { name: 'Data Analytics', requests: '8.2K', percentage: 30 },
                { name: 'Content Generator', requests: '6.8K', percentage: 25 },
              ].map((service, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{service.name}</span>
                    <span className="text-muted-foreground">{service.requests}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${service.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>
            Detailed performance analysis of your services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium">Response Time Distribution</h4>
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                Response time chart
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Error Rate Trends</h4>
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                Error rate chart
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">User Satisfaction</h4>
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                Satisfaction chart
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
