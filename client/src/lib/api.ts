const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export const api = {
  // Auth
  sendOtp: (email: string) => 
    request<{ success: boolean; message: string }>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  verifyOtp: (email: string, code: string) =>
    request<{ success: boolean; isNewUser: boolean; email?: string; user?: any }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    }),

  register: (data: { email: string; role: string; name: string; phone: string }) =>
    request<{ success: boolean; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Conversations
  getConversations: (userId: number, role: string) =>
    request<any[]>(`/conversations/user/${userId}?role=${role}`),

  createConversation: (data: { employerId: number; studentId: number; internshipId?: number }) =>
    request<any>('/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Messages
  getMessages: (conversationId: number) =>
    request<any[]>(`/conversations/${conversationId}/messages`),

  sendMessage: (conversationId: number, senderId: number, content: string) =>
    request<any>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ senderId, content }),
    }),

  markAsRead: (conversationId: number, userId: number) =>
    request<{ success: boolean }>(`/conversations/${conversationId}/read`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  // Internships
  getInternships: () => request<any[]>('/internships'),
  getInternship: (id: number) => request<any>(`/internships/${id}`),
  createInternship: (data: any) =>
    request<any>('/internships', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Applications
  getStudentApplications: (studentId: number) =>
    request<any[]>(`/applications/student/${studentId}`),
  createApplication: (data: any) =>
    request<any>('/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
