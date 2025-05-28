import { v4 } from "uuid";

export const formaterPhoto = (values: File, id: string) => {
   const fileExt = values.name.split(".").pop();
   const filePath = `${id}/avatar-${v4()}.${fileExt}`;
   return {
      file: values,
      filePath,
   };
};
