const getId = () => Math.floor(100000 + Math.random() * 900000);

export const findItemById = (data, targetId) => {
  // Kiểm tra nếu phần tử hiện tại có id là targetId
  if (data.id === targetId) {
    return data;
  }

  // Nếu có children, duyệt qua từng phần tử con và tìm tiếp
  if (data.children && data.children.length > 0) {
    // eslint-disable-next-line no-restricted-syntax
    for (const child of data.children) {
      const result = findItemById(child, targetId);
      if (result) {
        return result;
      }
    }
  }

  // Trả về null nếu không tìm thấy
  return null;
};

export const removeItemById = (data, idToRemove) => {
  if (!data.children) return data;

  data.children = data.children
    .filter((child) => child.id !== idToRemove)
    .map((child) => (child.children ? removeItemById(child, idToRemove) : child));

  return data;
};

export const findParentAndRemove = (data, idToRemove, removeAssignedVariable) => {
  // Kiểm tra nếu `data` không có `children`
  if (!data.children) return null;

  // Kiểm tra từng `child` trong mảng `children` của `data`
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < data.children.length; i++) {
    const child = data.children[i];

    // Nếu `child` có id trùng với id cần xóa
    if (child.id === idToRemove) {
      if (removeAssignedVariable && child?.config?.variable?.id) {
        removeAssignedVariable(child?.config?.variable?.id);
      }
      const updatedChildren = data.children.filter((c) => c.id !== idToRemove);
      return {
        id: data.id,
        group: updatedChildren,
      };
    }

    // Nếu `child` có mảng `children`, duyệt tiếp qua `children` của nó
    if (child.children) {
      const index = child.children.findIndex((c) => c.id === idToRemove);

      // Nếu tìm thấy `id cần xóa` trong `children` của `child`
      if (index !== -1) {
        const updatedChildren = [...child.children];
        updatedChildren.splice(index, 1);

        return {
          id: child.id,
          group: updatedChildren,
        };
      }

      // Nếu không tìm thấy `id` cần xóa ở `child`, tiếp tục đệ quy qua `children`
      const result = findParentAndRemove(child, idToRemove);
      if (result) return result;
    }
  }

  return null; // Trả về null nếu không tìm thấy id
};

export const duplicateItemById = (data, idToDuplicate) => {
  // Nếu không có `children`, trả về null
  if (!data.children) return null;

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < data.children.length; i++) {
    const child = data.children[i];

    // Nếu tìm thấy item có id cần duplicate
    if (child.id === idToDuplicate) {
      // Tạo một bản sao của item để duplicate
      const duplicatedChild = {
        ...child,
        config: {
          ...child.config,
          variable: null,
        },
      };
      duplicatedChild.id = getId();

      // Nếu item là một GROUP, cập nhật id cho tất cả các children của nó
      if (duplicatedChild.children) {
        duplicatedChild.children = duplicatedChild.children.map((grandChild) => {
          const newGrandChild = {
            ...grandChild,
            config: {
              ...grandChild.config,
              variable: null,
            },
            id: getId(),
          };
          // Cập nhật id cho tất cả các cấp con của nó nếu có
          if (newGrandChild.children) {
            // eslint-disable-next-line no-shadow
            newGrandChild.children = newGrandChild.children.map((child) => ({
              ...child,
              id: getId(),
            }));
          }
          return newGrandChild;
        });
      }

      // Chèn item duplicate ngay sau item gốc
      const updatedChildren = [
        ...data.children.slice(0, i + 1),
        duplicatedChild,
        ...data.children.slice(i + 1),
      ];

      return {
        id: data.id,
        group: updatedChildren,
      };
    }

    // Nếu `child` có mảng `children`, tiếp tục tìm và duplicate đệ quy
    if (child.children) {
      const result = duplicateItemById(child, idToDuplicate);
      if (result) return result;
    }
  }

  return null; // Trả về null nếu không tìm thấy `idToDuplicate`
};

export const updateItemConfigById = (data, idToUpdate, fieldKey, fieldValue) => {
  // Nếu không có `children`, trả về null
  if (!data.children) return null;

  // Duyệt qua từng `child` trong `children`
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < data.children.length; i++) {
    const child = data.children[i];

    // Nếu tìm thấy `id` cần cập nhật
    if (child.id === idToUpdate) {
      // Cập nhật `config` của item với `fieldKey` và `fieldValue` mới
      const updatedChild = {
        ...child,
        config: {
          ...child.config,
          [fieldKey]: fieldValue,
        },
      };

      // Cập nhật lại `children` của parent
      const updatedChildren = [
        ...data.children.slice(0, i),
        updatedChild,
        ...data.children.slice(i + 1),
      ];

      return {
        id: data.id,
        group: updatedChildren,
      };
    }

    // Nếu `child` có `children`, tiếp tục tìm đệ quy
    if (child.children) {
      const result = updateItemConfigById(child, idToUpdate, fieldKey, fieldValue);
      if (result) return result;
    }
  }

  return null; // Trả về null nếu không tìm thấy `idToUpdate`
};

export const addColumnToGrid = (data, targetId) => {
  // Nếu không có `children`, trả về null
  if (!data.children) return null;

  // Tạo object mới cần thêm vào
  const newObject = {
    id: getId(),
    type: 'GROUP',
    typeGroup: 'layout',
    name: 'Group',
    children: [],
    icon: 'pixelarticons:group',
    isChildGrid: true,
    config: {
      name: 'Group',
      hideLabel: false,
      showBorder: false,
      labelWidth: 100,
      width: null,
      height: null,
    },
    class: 'group-option',
  };

  const targetObject = data.children.find((item) => item.id === targetId);

  if (targetObject && targetObject.children) {
    targetObject.children.push(newObject);

    return {
      id: targetId,
      group: targetObject.children,
    };
  }

  return null;
};

export const showValueHasMinMax = (
  [min, max],
  value,
  valueDefault = '100%',
  typeReturn = 'string'
) => {
  if (!value) {
    return valueDefault;
  }

  let result;

  if (value < min) {
    result = min;
  } else if (value > max) {
    result = max;
  } else {
    result = value;
  }

  return typeReturn === 'string' ? `${result}px` : result;
};
