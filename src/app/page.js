"use client";
import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Link,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Snackbar,
  Switch,
  AppBar,
  Toolbar,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import generateSlug from "./functions/generateSlug";

export default function Home() {
  const [url, setUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [links, setLinks] = useState([]);
  const [result, setResult] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, msg: "" });
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("shortLinks");
    if (saved) setLinks(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("shortLinks", JSON.stringify(links));
  }, [links]);

  function shorten(e) {
  e.preventDefault();
  if (!url) return;

  try {
    new URL(url);
  } catch {
    setResult({ error: "❌ Invalid URL. Please enter a valid URL!" });
    return;
  }

  const slug = customSlug || generateSlug();

  if (links.find((l) => l.slug === slug)) {
    setResult({ error: "Slug already exists!" });
    return;
  }

  const now = new Date();
  const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000); 

  const record = {
    slug,
    url,
    createdAt: now.toISOString(),
    expiresAt: expiry.toISOString(),
    clicks: 0,
    lastClicked: null,
  };

  setLinks([...links, record]);
  setResult({
    shortUrl: `${window.location.origin}/${slug}`,
    slug,
    url,
    expiresAt: record.expiresAt,
  });
  setUrl("");
  setCustomSlug("");
  setSnackbar({ open: true, msg: "✅ Link created successfully!" });
}


  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    setSnackbar({ open: true, msg: "📋 Link copied!" });
  }

  function deleteLink(slug) {
    setLinks(links.filter((l) => l.slug !== slug));
    setSnackbar({ open: true, msg: "🗑️ Link deleted" });
  }

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: { main: "#1976d2" },
      secondary: { main: "#9c27b0" },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      {/* AppBar with Dark Mode Toggle */}
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            🔗 Friendly URL Shortener
          </Typography>
          <Tooltip title="Toggle Dark Mode">
            <Switch
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ pb: 6 }}>
        {/* Form Card */}
        <Card elevation={4} sx={{ borderRadius: 3, my: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Create a Short Link
            </Typography>
            <Box
              component="form"
              onSubmit={shorten}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <TextField
                label="Enter a long URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Custom slug (optional)"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value)}
                fullWidth
              />
              <Button
                variant="contained"
                size="large"
                color="primary"
                type="submit"
              >
                ✨ Shorten Link
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Result */}
        {result && (
          <Alert severity={result.error ? "error" : "success"} sx={{ mb: 3 }}>
            {result.error ? (
              <>❌ {result.error}</>
            ) : (
              <>
                ✅ Short URL:{" "}
                <Link
                  target="_blank" 
                  rel="noopener noreferrer"
                  href={`/${result.slug}`}
                  underline="hover"
                >
                  {result.shortUrl}
                </Link>
                <Tooltip title="Copy to clipboard">
                  <IconButton
                    size="small"
                    onClick={() => copyToClipboard(result.shortUrl)}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <br />
                ⏳ Expires At:{" "}
                <b>{new Date(result.expiresAt).toLocaleString()}</b>
              </>
            )}
          </Alert>
        )}

        {/* Analytics */}
        <Typography variant="h5" gutterBottom sx={{ mt: 5 }}>
          📊 Analytics Dashboard
        </Typography>

        {links.length === 0 ? (
          <Typography color="text.secondary">No links yet</Typography>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 2, borderRadius: 3 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Slug</TableCell>
                  <TableCell>Original URL</TableCell>
                  <TableCell>Clicks</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Expires At</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Clicked</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {links.map((l) => {
                  const expired = new Date(l.expiresAt) < new Date();
                  return (
                    <TableRow
                      key={l.slug}
                      sx={{
                        "&:hover": { backgroundColor: "action.hover" },
                      }}
                    >
                      <TableCell>
                        <Link href={`/${l.slug}`} underline="hover" target="_blank" rel="noopener noreferrer">
                          {window.location.origin}/{l.slug}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={l.url}
                          target="_blank"
                          rel="noreferrer"
                          underline="hover"
                        >
                          {new URL(l.url).hostname}
                        </Link>
                      </TableCell>
                      <TableCell>{l.clicks}</TableCell>
                      <TableCell>
                        {new Date(l.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {new Date(l.expiresAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={expired ? "Expired" : "Active"}
                          color={expired ? "error" : "success"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {l.lastClicked
                          ? new Date(l.lastClicked).toLocaleString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Delete link">
                          <IconButton
                            color="error"
                            onClick={() => deleteLink(l.slug)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={2000}
          onClose={() => setSnackbar({ open: false, msg: "" })}
          message={snackbar.msg}
        />
      </Container>
    </ThemeProvider>
  );
}