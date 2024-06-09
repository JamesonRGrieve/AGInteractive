import { DataGrid, GridToolbar, gridClasses } from '@mui/x-data-grid';
import { Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, TextFieldProps } from '@mui/material';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import { alpha, styled } from '@mui/material/styles';
import { useState, useEffect, ReactNode } from 'react';
import { InteractiveConfig } from '@/types/InteractiveConfigContext';

const ODD_OPACITY = 1;

const StripedDataGrid = styled(DataGrid)(({ theme }) => ({
  /*
  [`& .${gridClasses.row}.even`]: {
    backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#696a6b',
    '&:hover, &.Mui-hovered': {
      backgroundColor: theme.palette.action.hover,
      '@media (hover: none)': {
        backgroundColor: 'transparent',
      },
    },
    '&.Mui-selected': {
      backgroundColor: alpha(theme.palette.primary.main, ODD_OPACITY + theme.palette.action.selectedOpacity),
      '&:hover, &.Mui-hovered': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          ODD_OPACITY + theme.palette.action.selectedOpacity + theme.palette.action.hoverOpacity,
        ),
        // Reset on touch devices, it doesn't add specificity
        '@media (hover: none)': {
          backgroundColor: alpha(theme.palette.primary.main, ODD_OPACITY + theme.palette.action.selectedOpacity),
        },
      },
    },
  },*/
}));

export const DataGridFromCSV = ({ state, csvData }: { state: InteractiveConfig; csvData: string[] }): ReactNode => {
  console.log('Raw Data', csvData);
  const [open, setOpen] = useState(false);
  const [userMessage, setUserMessage] = useState('Surprise me!');
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [filteredColumns, setFilteredColumns] = useState([]);
  const [columns, setColumns] = useState([]);
  useEffect(() => {
    const rawData = csvData.map((row) => row.split(',').map((cell) => cell.trim().replaceAll('"', '')));
    setColumns(
      (rawData[0][0].toLowerCase().includes('id') ? rawData[0].slice(1) : rawData[0]).map((header) => ({
        field: header,
        width: Math.max(160, header.length * 10),
        flex: 1,
        resizeable: true,
        headerName: header,
        sx: {
          '& .MuiDataGrid-cell': {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          },
        },
      })),
    );
    setRows(
      rawData.slice(1).map((row, index) =>
        rawData[0][0].toLowerCase().includes('id')
          ? {
              id: row[0],
              ...Object.fromEntries(row.slice(1).map((cell, index) => [rawData[0][index + 1], cell])),
            }
          : {
              id: index,
              ...Object.fromEntries(row.map((cell, index) => [rawData[0][index], cell])),
            },
      ),
    );
  }, [csvData]);

  useEffect(() => {
    setFilteredRows(rows);
  }, rows);
  useEffect(() => {
    setFilteredColumns(columns);
  }, columns);
  const getInsights = async (userMessage): Promise<void> => {
    const stringifiedColumns = ['id', ...filteredColumns.map((header) => header.field)].join(',');
    const stringifiedRows = filteredRows.map((row) => columns.map((header) => row[header.field]).join(','));
    console.log('Data Analysis', [stringifiedColumns, ...stringifiedRows]);
    console.log(
      await state.agixt.runChain('Data Analysis', userMessage, state.agent, false, 1, {
        conversation_name: state.overrides.conversationName,
        text: [stringifiedColumns, ...stringifiedRows].join('\n'),
      }),
    );
  };
  const gridChange = (state) => {
    console.log(state);
    setFilteredRows(
      rows.filter((row) =>
        Object.keys(state.filter.filteredRowsLookup)
          .filter((key) => state.filter.filteredRowsLookup[key])
          .includes(row.id),
      ),
    );
    setFilteredColumns(
      columns.filter(
        (column) =>
          !Object.keys(state.columns.columnVisibilityModel)
            .filter((key) => !state.columns.columnVisibilityModel[key])
            .includes(column.field),
      ),
    );
  };
  return rows.length > 1 ? (
    <Box display='flex' flexDirection='column' gap='1rem'>
      <StripedDataGrid
        density='compact'
        rows={rows}
        columns={columns}
        components={{ Toolbar: GridToolbar }}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          },
        }}
        getRowClassName={(params) => (params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd')}
        onStateChange={gridChange}
      />
      <Box
        sx={{
          display: 'flex',
        }}
      >
        <Button
          color='info'
          variant='outlined'
          onClick={() => {
            setOpen(true);
          }}
        >
          <TipsAndUpdatesOutlinedIcon />
          Get Insights
        </Button>
      </Box>
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <DialogTitle>Get Insights</DialogTitle>
        <DialogContent>
          <TextField
            margin='dense'
            id='name'
            label='What would you like insights on?'
            fullWidth
            value={userMessage}
            onChange={(event) => {
              setUserMessage(event.target.value);
            }}
            onClick={(e) => {
              if ((e.target as TextFieldProps).value === 'Surprise me!') {
                setUserMessage('');
              }
            }}
            variant='outlined'
            color='info'
          />
        </DialogContent>
        <DialogActions>
          <Button
            color='error'
            onClick={() => {
              setOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            color='info'
            onClick={() => {
              getInsights(userMessage);
              setOpen(false);
            }}
          >
            Get Insights
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  ) : (
    csvData
  );
};
export default DataGridFromCSV;
