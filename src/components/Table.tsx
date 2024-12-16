import { DataTable, DataTablePageEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import axios, { all } from "axios";
import { useEffect, useRef, useState } from "react";
import { OverlayPanel } from "primereact/overlaypanel";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { ArtWork } from "../interface/table";
export default function Table() {
  const [dataValues, setDataValues] = useState<ArtWork[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const btnRef = useRef<OverlayPanel>(null);

  const [dataFetch, setDataFetch] = useState(0);
  const [page, setPages] = useState(1);

  const [allSelectedRows, setAllSelectedRows] = useState<ArtWork[]>([]);
  const rowsPerPage = 12;
  const fetchData = async (p = 1) => {
    setLoading(true);
    try {
      const dataResponse = await axios.get(
        `https://api.artic.edu/api/v1/artworks?page=${p}&limit=${rowsPerPage}`
      );
      const { data, pagination } = dataResponse.data;
      setDataValues(data);
      setDataFetch(pagination.total_pages || 0);
      setPages(p);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData(1);
  }, []);

  const pageChange = (event: DataTablePageEvent) => {
    if (event.page !== undefined) {
      const newPage = event.page + 1;
      setPages(event.page);
      fetchData(newPage);
    }
  };
  const handleSelectionChange = (e: { value: any[] }) => {
    const selectedRows = e.value;
    const updatedSelection = [
      ...allSelectedRows.filter(
        (row) => !dataValues.some((current) => current.id === row.id)
      ),
      ...selectedRows,
    ];
    setAllSelectedRows(updatedSelection);
  };
  const submitBtn = async () => {
    const numRows = parseInt(searchInput);
    if (!isNaN(numRows) && numRows > 0) {
      const currentRows = Math.min(numRows, dataValues.length);
      const selectedFromCurrentPage = dataValues.slice(0, currentRows);
      let allSelected = selectedFromCurrentPage;
      if (numRows > currentRows) {
        const remainingRows = numRows - currentRows;
        const additionalRows = await selectAdditionalRows(
          remainingRows,
          page + 1
        );
        allSelected = [...selectedFromCurrentPage, ...additionalRows];
      }
      setAllSelectedRows(allSelected);
    } else {
      alert(`Please enter a valid number between 1 and ${dataFetch}`);
    }
    setSearchInput("");
    btnRef.current?.hide();
  };
  const selectAdditionalRows = async (
    count: number,
    startPage: number
  ): Promise<ArtWork[]> => {
    const rows: ArtWork[] = [];
    let page: number = startPage;
    while (rows.length < count) {
      const response = await axios.get(`
          https://api.artic.edu/api/v1/artworks?page=${page}&limit=${rowsPerPage}
          `);
      const { data } = response.data;
      const rowsNeeded: number = count - rows.length;
      rows.push(...data.slice(0, rowsNeeded));
      page++;
    }
    return rows;
  };
  const isRowSelected = (row: ArtWork) =>
    allSelectedRows.some((selected) => selected.id === row.id);
  const dropDownBtn = () => (
    <Button type="button" onClick={(e) => btnRef.current?.toggle(e)}>
      <i className="pi pi-angle-down" style={{ color: "black" }}></i>
    </Button>
  );
  return (
    <div>
      <OverlayPanel ref={btnRef}>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <InputText
            keyfilter="int"
            placeholder="Select rows..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button
            style={{ backgroundColor: "var(--primary-color)" }}
            type="submit"
            onClick={submitBtn}
          >
            Submit
          </Button>
        </div>
      </OverlayPanel>

      <DataTable
        value={dataValues}
        selection={dataValues.filter(isRowSelected)}
        selectionMode="multiple"
        onSelectionChange={handleSelectionChange}
        paginator
        rows={12}
        totalRecords={dataFetch}
        onPage={pageChange}
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: "50rem" }}
        lazy
        loading={loading}
      >
        <Column
          selectionMode="multiple"
          headerStyle={{ width: "3rem" }}
        ></Column>
        <Column header={dropDownBtn()} style={{ width: "25%" }}></Column>

        <Column field="title" header="Title" style={{ width: "25%" }}></Column>

        <Column
          field="place_of_origin"
          header="Place of Origin"
          style={{ width: "25%" }}
        ></Column>
        <Column
          field="artist_display"
          header="Artist Display"
          style={{ width: "25%" }}
        ></Column>
        <Column
          field="inscriptions"
          header="Inscriptions"
          style={{ width: "25%" }}
        ></Column>
        <Column
          field="date_start"
          header="Date Start"
          style={{ width: "25%" }}
        ></Column>
        <Column
          field="date_end"
          header="Date End"
          style={{ width: "25%" }}
        ></Column>
      </DataTable>
    </div>
  );
}
