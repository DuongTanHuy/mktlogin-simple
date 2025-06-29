import { useState, useCallback } from 'react';

// ----------------------------------------------------------------------

export default function useTable(props) {
  const [dense, setDense] = useState(!!props?.defaultDense);

  const [page, setPage] = useState(props?.defaultCurrentPage || 0);

  const [orderBy, setOrderBy] = useState(props?.defaultOrderBy || 'name');

  const [rowsPerPage, setRowsPerPage] = useState(props?.defaultRowsPerPage || 10);

  const [order, setOrder] = useState(props?.defaultOrder || 'asc');

  const [selected, setSelected] = useState(props?.defaultSelected || []);

  const onSort = useCallback(
    (id) => {
      const isAsc = orderBy === id && order === 'asc';
      if (id !== '') {
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(id);
      }
    },
    [order, orderBy]
  );

  const onSelectRow = useCallback((inputValue) => {
    // let newSelected;
    // if (inputValue?.id) {
    //   const isSelected = selected.some((value) => value.id === inputValue.id);
    //   newSelected = isSelected
    //     ? selected.filter((value) => value.id !== inputValue.id)
    //     : [...selected, inputValue];
    // } else {
    //   const isSelected = selected.includes(inputValue);
    //   newSelected = isSelected
    //     ? selected.filter((value) => value !== inputValue)
    //     : [...selected, inputValue];
    // }

    setSelected((prev) => {
      let newSelected;
      if (inputValue?.id) {
        const isSelected = prev.some((value) => value.id === inputValue.id);
        newSelected = isSelected
          ? prev.filter((value) => value.id !== inputValue.id)
          : [...prev, inputValue];
      } else {
        const isSelected = prev.includes(inputValue);
        newSelected = isSelected
          ? prev.filter((value) => value !== inputValue)
          : [...prev, inputValue];
      }
      return newSelected;
    });
  }, []);

  const onChangeRowsPerPage = useCallback((event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  }, []);

  const onChangeDense = useCallback((event) => {
    setDense(event.target.checked);
  }, []);

  const onSelectAllRows = useCallback((checked, inputValue) => {
    if (checked) {
      setSelected(inputValue);
      return;
    }
    setSelected([]);
  }, []);

  const onShiftSelectAllRows = useCallback((inputValue) => {
    setSelected((prev) => {
      const newSelected = [...prev];
      inputValue.forEach((value, i) => {
        const index = newSelected.findIndex((item) => item.id === value.id);
        if (index === -1) {
          newSelected.push(value);
        } else {
          newSelected.splice(index, 1);
        }
      });
      return newSelected;
    });
  }, []);

  const onChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onUpdatePageDeleteRow = useCallback(
    (totalRowsInPage) => {
      setSelected([]);
      if (page) {
        if (totalRowsInPage < 2) {
          setPage(page - 1);
        }
      }
    },
    [page]
  );

  const onUpdatePageDeleteRows = useCallback(
    ({ totalRows, totalRowsInPage, totalRowsFiltered }) => {
      const totalSelected = selected.length;

      setSelected([]);

      if (page) {
        if (totalSelected === totalRowsInPage) {
          setPage(page - 1);
        } else if (totalSelected === totalRowsFiltered) {
          setPage(0);
        } else if (totalSelected > totalRowsInPage) {
          const newPage = Math.ceil((totalRows - totalSelected) / rowsPerPage) - 1;
          setPage(newPage);
        }
      }
    },
    [page, rowsPerPage, selected.length]
  );

  return {
    dense,
    order,
    page,
    orderBy,
    rowsPerPage,
    //
    selected,
    onSelectRow,
    onSelectAllRows,
    onShiftSelectAllRows,
    //
    onSort,
    onChangePage,
    onChangeDense,
    onResetPage,
    onChangeRowsPerPage,
    onUpdatePageDeleteRow,
    onUpdatePageDeleteRows,
    //
    setPage,
    setDense,
    setOrder,
    setOrderBy,
    setSelected,
    setRowsPerPage,
  };
}
