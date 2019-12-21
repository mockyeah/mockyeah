const parseBody = async (res: Response) => {
  const { status } = res;

  if (status === 204) return undefined;

  return res.text() || undefined;
};

export { parseBody };
