const parseBody = async (res: Response) => {
  const { status } = res;

  if (status === 204) return '';

  return res.text() || '';
};

export { parseBody };
