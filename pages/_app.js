import "../styles/globals.css";
import { useState, useCallback } from "react";
import { useRouter } from "next/router";
import { setCookie, getCookie } from "cookies-next";
import Link from "next/link";
import { SettingsProvider } from "../lib/SettingsContext";
import {
  Box,
  Drawer,
  CssBaseline,
  Toolbar,
  Typography,
  Divider,
} from "@mui/material";
import MuiAppBar from "@mui/material/AppBar";
import IconButton from "@mui/material/IconButton";
import ListItemButton from "@mui/material/ListItemButton";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import {
  ChevronLeft,
  Menu,
  SupportAgent,
  ChatBubble,
  InsertLink,
  SmartToy,
} from "@mui/icons-material";
import MenuList from "../components/menu/MenuList";
import MenuAgentList from "../components/systems/agent/AgentList";
import { MenuDarkSwitch } from "../components/menu/MenuDarkSwitch";
import { red } from "@mui/material/colors";
import useSWR from "swr";
import { sdk } from "../lib/apiClient";

const drawerWidth = 200;
const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  })
);
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));
const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
  backgroundColor: theme.palette.primary.main,
  color: "white",
}));
export default function App({ Component, pageProps, dark }) {
  const [open, setOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(dark);
  const router = useRouter();
  const pages = [
    {
      name: "Agents",
      href: "agent",
      Icon: SmartToy,
    },
    {
      name: "Prompts",
      href: "prompt",
      Icon: ChatBubble,
    },
    {
      name: "Chains",
      href: "chain",
      Icon: InsertLink,
    },
  ];

  const themeGenerator = (darkMode) =>
    createTheme({
      palette: {
        mode: darkMode ? "dark" : "light",
        primary: {
          main: "#273043",
        },
      },
    });
  const theme = themeGenerator(darkMode);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleToggleDarkMode = useCallback(() => {
    setDarkMode((oldVal) => {
      const newVal = !oldVal;
      setCookie("dark", newVal.toString());
      return newVal;
    });
  }, []);
  const agents = useSWR("agent", async () => sdk.getAgents());
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar position="fixed" open={open}>
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "left" }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                edge="start"
                sx={{ mr: 2, ...(open && { display: "none" }) }}
              >
                <Menu />
              </IconButton>
              <Typography variant="h6" component="h1" noWrap>
                <Link href="/">AGiXT</Link>
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "left" }}>
              <Link href={`/agent`} passHref>
                <ListItemButton
                  variant="contained"
                  color="primary"
                  sx={{ pl: "1rem" }}
                  selected={router.pathname.split("/")[1] == "agent"}
                >
                  <Typography noWrap>
                    {router.pathname.split("/")[1] == "agent" ? (
                      <b>Agents</b>
                    ) : (
                      <>Agents</>
                    )}
                  </Typography>
                </ListItemButton>
              </Link>
              <Link href={`/prompt`} passHref>
                <ListItemButton
                  variant="contained"
                  color="primary"
                  sx={{ pl: "1rem" }}
                  selected={router.pathname.split("/")[1] == "prompt"}
                >
                  <Typography noWrap>
                    {router.pathname.split("/")[1] == "prompt" ? (
                      <b>Prompts</b>
                    ) : (
                      <>Prompts</>
                    )}
                  </Typography>
                </ListItemButton>
              </Link>
              <Link href={`/chain`} passHref>
                <ListItemButton
                  variant="contained"
                  color="primary"
                  sx={{ pl: "1rem" }}
                  selected={router.pathname.split("/")[1] == "chain"}
                >
                  <Typography noWrap>
                    {router.pathname.split("/")[1] == "chain" ? (
                      <b>Chains</b>
                    ) : (
                      <>Chains</>
                    )}
                  </Typography>
                </ListItemButton>
              </Link>
            </Box>
            <MenuDarkSwitch
              checked={darkMode}
              onChange={handleToggleDarkMode}
            />
          </Toolbar>
        </AppBar>
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
          variant="persistent"
          anchor="left"
          open={open}
        >
          <DrawerHeader sx={{ justifyContent: "space-between", pl: "1rem" }}>
            <IconButton onClick={handleDrawerClose}>
              <ChevronLeft fontSize="large" sx={{ color: "white" }} />
            </IconButton>
          </DrawerHeader>
          <Divider />
          <MenuAgentList data={agents.data ? agents.data : []} />
        </Drawer>
        <Main open={open} sx={{ padding: "0" }}>
          <DrawerHeader />
          <SettingsProvider>
            <Component {...pageProps} />
          </SettingsProvider>
        </Main>
      </Box>
    </ThemeProvider>
  );
}
App.getInitialProps = async ({ ctx }) => {
  const dark = getCookie("dark", ctx);
  return { dark: dark };
};
