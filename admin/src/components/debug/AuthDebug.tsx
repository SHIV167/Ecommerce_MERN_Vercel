import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { checkApiConnection } from '@/utils/apiDebug';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

export default function AuthDebug() {
  const [isOpen, setIsOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState<string>('Not checked');
  const [authStatus, setAuthStatus] = useState<string>('Not checked');
  const [cookies, setCookies] = useState<string>('Not checked');
  const { toast } = useToast();

  const checkApiStatus = async () => {
    try {
      const isConnected = await checkApiConnection();
      setApiStatus(isConnected ? 'Connected' : 'Connection failed');
      setAuthStatus(isConnected ? 'Authenticated' : 'Not authenticated');
    } catch (error) {
      setApiStatus('Error checking connection');
      console.error('API check error:', error);
    }
  };

  const checkCookies = () => {
    const allCookies = document.cookie;
    setCookies(allCookies || 'No cookies found');
  };

  const fixAuthCookies = async () => {
    try {
      // Call the server endpoint to refresh auth cookies
      const response = await axios.post('/api/admin/auth/refresh', {}, { withCredentials: true });
      toast({
        title: 'Auth cookies refreshed',
        description: 'Please refresh the page to see if the issue is resolved.',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to refresh auth cookies',
        description: error.message || 'Please try logging in again',
        variant: 'destructive'
      });
    }
  };

  const clearAllCookies = () => {
    document.cookie.split(';').forEach(cookie => {
      document.cookie = cookie
        .replace(/^ +/, '')
        .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    });
    setCookies('No cookies (cleared)');
    toast({
      title: 'All cookies cleared',
      description: 'Please log in again.',
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsOpen(true)}
          className="bg-gray-100 hover:bg-gray-200"
        >
          Debug
        </Button>
      ) : (
        <Card className="w-80">
          <CardHeader className="py-3">
            <CardTitle className="text-md flex justify-between items-center">
              Auth Debug
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsOpen(false)}
              >
                ✕
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-2">
              <div><strong>API Status:</strong> {apiStatus}</div>
              <div><strong>Auth Status:</strong> {authStatus}</div>
              <div className="mt-2">
                <strong>Cookies:</strong>
                <div className="mt-1 max-h-20 overflow-auto text-xs p-2 bg-gray-100 rounded">
                  {cookies}
                </div>
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <Button size="sm" onClick={checkApiStatus} className="w-full">
                Check API Connection
              </Button>
              <Button size="sm" onClick={checkCookies} className="w-full">
                Check Cookies
              </Button>
              <Button size="sm" onClick={fixAuthCookies} className="w-full">
                Fix Auth Cookies
              </Button>
              <Button size="sm" variant="destructive" onClick={clearAllCookies} className="w-full">
                Clear All Cookies
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
