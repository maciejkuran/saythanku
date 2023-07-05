const reqConfig = (method: string, data: any) => {
  return {
    method: method,
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  };
};

export default reqConfig;
