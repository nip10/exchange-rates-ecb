export const isValidDate = (date: unknown) => {
  return (
    Object.prototype.toString.call(date) === '[object Date]' &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    !Number.isNaN(date as any) &&
    // handle NULL date objects
    !Number.isNaN((date as any).valueOf())
  );
};
