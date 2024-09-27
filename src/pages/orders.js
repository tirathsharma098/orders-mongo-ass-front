import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import {
    Box,
    Container,
    InputAdornment,
    TableFooter,
    TablePagination,
    TextField,
    Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import API from "../config/api";
import axios from "axios";
import { toast } from "react-toastify";
import { Search } from "@mui/icons-material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { format } from "date-fns";
const toastOptions = {
    position: "top-right",
};

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
        backgroundColor: theme.palette.action.hover,
    },
    "&:last-child td, &:last-child th": {
        border: 0,
    },
}));

export default function Orders() {
    const [pageNu, setPageNu] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [gotOrders, setGotOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalProduct, setTotalProduct] = useState(0);
    const [totalSales, setTotalSales] = useState(0);
    const [orderDate, setOrderDate] = useState();
    const [productName, setProductName] = useState();
    const [salePriceFrom, setSalePriceFrom] = useState();
    const [salePriceTo, setSalePriceTo] = useState();
    const [searchTimeoutId, setSearchTimeoutId] = useState();
    useEffect(() => {
        const getOrders = async () => {
            console.log(">> API CALLING");
            setIsLoading(true);
            try {
                const getOrders = await axios({
                    url: API.endpoint + "/order/get-list",
                    method: "GET",
                    params: {
                        min_sale_price: salePriceFrom,
                        max_sale_price: salePriceTo,
                        search_term: productName,
                        per_page: perPage,
                        page_number: pageNu + 1,
                        order_date: orderDate,
                    },
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                const getTotalProduct = await axios(
                    API.endpoint + "/order/total-product",
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );
                const getTotalSales = await axios(
                    API.endpoint + "/order/total-sales",
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );
                console.log(">> API RES", getOrders);
                if (getOrders.data?.success === false) {
                    toast.error(getOrders.data.message, toastOptions);
                } else if (getOrders.data?.success === true) {
                    setGotOrders(getOrders.data.data);
                    setTotalProduct(getTotalProduct.data.data);
                    setTotalSales(getTotalSales.data.data);
                } else throw new Error("Something went wrong");
                setIsLoading(false);
            } catch (err) {
                console.log(">> err", err);
                setIsLoading(false);
                toast.error("Something went wrong", toastOptions);
            }
        };
        getOrders();
    }, [perPage, pageNu, orderDate, productName, salePriceFrom, salePriceTo]);

    const handleChangePage = (event, newPage) => {
        setPageNu(newPage);
    };
    const handleChangeRowsPerPage = (event) => {
        setPerPage(event.target.value);
    };
    const handleSearch = (e) => {
        if(searchTimeoutId) clearTimeout(searchTimeoutId);
        const searchTimeout = setTimeout(()=> {
            setProductName(e.target.value)
        }, 800)
        setSearchTimeoutId(searchTimeout);
    }

    return (
        <Container fixed>
            <Box
                display="flex"
                alignItems="center"
                justifyContent="space-evenly"
                width="100%"
                m={1}
            >
                <TextField
                    variant="outlined"
                    placeholder="Product Name"
                    onChange={(e) => handleSearch(e)}
                    fullWidth
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        ),
                    }}
                    size="small"
                    sx={{
                        "& .MuiOutlinedInput-root": {
                            borderRadius: "24px",
                        },
                        width: "300px",
                    }}
                />
                <Typography>
                    <b>Total Products:</b> {totalProduct}
                </Typography>
                <Typography>
                    <b>Total Sales:</b> {totalSales.totalOrders}
                </Typography>
                <Typography>
                    <b>Total Admin Price:</b> {totalSales.totalAdminPrice}
                </Typography>
                <Typography>
                    <b>Total Sale Price:</b> {totalSales.totalSalePrice}
                </Typography>
            </Box>
            <Box
                display="flex"
                alignItems="center"
                justifyContent="right"
                width="100%"
            >
                <TextField
                    variant="outlined"
                    placeholder="Sale Price From"
                    type="number"
                    size="small"
                    sx={{ p: 1 }}
                    onChange={(e) => setSalePriceFrom(e.target.value)}
                />
                <TextField
                    variant="outlined"
                    placeholder="Sale Price To"
                    type="number"
                    size="small"
                    onChange={(e) => setSalePriceTo(e.target.value)}
                    sx={{ p: 1 }}
                />
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        label="Order Date"
                        onChange={(newValue) => {
                            setOrderDate(newValue);
                        }}
                        slotProps={{
                            textField: {
                                size: "small",
                            },
                        }}
                    />
                </LocalizationProvider>
            </Box>
            <Box sx={{ mt: 1 }}>
                <TableContainer component={Paper}>
                    <Table
                        sx={{ minWidth: 700 }}
                        aria-label="customized table"
                        size="small"
                    >
                        <TableHead>
                            <TableRow>
                                <StyledTableCell>Sr Nu.</StyledTableCell>
                                <StyledTableCell>Product Name</StyledTableCell>
                                <StyledTableCell>Product ID</StyledTableCell>
                                <StyledTableCell>Admin Price</StyledTableCell>
                                <StyledTableCell>Sale Price</StyledTableCell>
                                <StyledTableCell>Quantity</StyledTableCell>
                                <StyledTableCell>Order Date</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading && (
                                <StyledTableRow>
                                    <StyledTableCell colSpan={7}>
                                        Fetching data...
                                    </StyledTableCell>
                                </StyledTableRow>
                            )}
                            {!isLoading &&
                                gotOrders?.items?.map((row, i) => (
                                    <StyledTableRow key={row._id}>
                                        <StyledTableCell>
                                            {i + 1 + perPage * pageNu}
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            {row.product_name}
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            {row.product_id}
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            {row.admin_price}
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            {row.sale_price}
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            {row.quantity}
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            {format(new Date(row.order_date), 'dd MMM, yyyy')}
                                        </StyledTableCell>
                                    </StyledTableRow>
                                ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={5} sx={{ padding: 0 }}>
                                    <TablePagination
                                        rowsPerPageOptions={[5, 10, 25]}
                                        component="div"
                                        count={gotOrders?.total_items || 0}
                                        rowsPerPage={perPage}
                                        page={pageNu}
                                        onPageChange={handleChangePage}
                                        onRowsPerPageChange={
                                            handleChangeRowsPerPage
                                        }
                                    />
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </TableContainer>
            </Box>
        </Container>
    );
}
