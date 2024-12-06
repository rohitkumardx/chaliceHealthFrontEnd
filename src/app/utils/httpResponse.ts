export function getErrorMessage(response: any) {
  if (response.error) {
    return response?.error?.messages?.join(',') || response?.error?.exception || response?.message || 'Something went wrong. Please contact your administrator.';
  }

  return response;
}
