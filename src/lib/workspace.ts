export const callGoogleApi = async (url: string, method: string = 'GET', body: any = null) => {
  const token = localStorage.getItem('google_access_token');
  if (!token) {
    throw new Error('Not authenticated with Google Workspace');
  }

  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Google API Error: ${response.statusText}`);
  }

  // Handle empty responses
  if (response.status === 204) return null;
  return await response.json();
};

// Example implementations using the token:
export const getMyDriveFiles = async () => {
  return await callGoogleApi('https://www.googleapis.com/drive/v3/files?pageSize=10&fields=files(id,name)');
};

export const createSheet = async (title: string) => {
  return await callGoogleApi('https://sheets.googleapis.com/v4/spreadsheets', 'POST', {
    properties: { title }
  });
};

export const listUpcomingEvents = async () => {
  const timeMin = new Date().toISOString();
  return await callGoogleApi(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&maxResults=10&singleEvents=true&orderBy=startTime`);
};
