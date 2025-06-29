const getId = () => Math.floor(100000 + Math.random() * 900000);

export const initialGroup = {
  id: getId(),
  type: "GROUP",
  children: [],
};
