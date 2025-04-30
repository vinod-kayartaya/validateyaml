import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Snackbar,
} from '@mui/material';
import { Editor } from '@monaco-editor/react';
import jsYaml from 'js-yaml';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const YamlValidator = () => {
  const [yamlInput, setYamlInput] = useState('# Enter your YAML here\n');
  const [outputFormat, setOutputFormat] = useState('json');
  const [output, setOutput] = useState('');
  const [error, setError] = useState(null);
  const [url, setUrl] = useState('');
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  const validateYaml = (input) => {
    try {
      const parsed = jsYaml.load(input);
      let formatted;

      switch (outputFormat) {
        case 'json':
          formatted = JSON.stringify(parsed, null, 2);
          break;
        case 'python':
          formatted = convertToPython(parsed);
          break;
        case 'canonical':
          formatted = jsYaml.dump(parsed, { lineWidth: -1 });
          break;
        default:
          formatted = JSON.stringify(parsed, null, 2);
      }

      setOutput(formatted);
      setError(null);
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  };

  const convertToPython = (obj) => {
    const toPythonStr = (val) => {
      if (val === null) return 'None';
      if (typeof val === 'boolean') return val ? 'True' : 'False';
      if (typeof val === 'string') return `'${val.replace(/'/g, "\\'")}'`;
      if (Array.isArray(val)) {
        return `[${val.map((item) => toPythonStr(item)).join(', ')}]`;
      }
      if (typeof val === 'object') {
        const entries = Object.entries(val)
          .map(([k, v]) => `    '${k}': ${toPythonStr(v)}`)
          .join(',\n');
        return `{\n${entries}\n}`;
      }
      return val;
    };

    return toPythonStr(obj);
  };

  const handleUrlValidate = async () => {
    try {
      const response = await fetch(url);
      const text = await response.text();
      setYamlInput(text);
      validateYaml(text);
    } catch (e) {
      setError('Failed to fetch URL: ' + e.message);
    }
  };

  const handleEditorChange = (value) => {
    setYamlInput(value);
    validateYaml(value);
  };

  const exampleYaml = `# Example YAML
server:
  host: localhost
  port: 8080
database:
  url: mongodb://localhost:27017
  name: myapp
features:
  - authentication
  - authorization
  - logging
settings:
  debug: true
  cache:
    enabled: true
    ttl: 3600`;

  const loadExample = () => {
    setYamlInput(exampleYaml);
    validateYaml(exampleYaml);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setShowCopySuccess(true);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleCloseCopySuccess = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowCopySuccess(false);
  };

  useEffect(() => {
    validateYaml(yamlInput);
    // eslint-disable-next-line
  }, [outputFormat]);

  return (
    <Container maxWidth='lg' sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <img
          src='/favicon.png'
          alt='YAML Validator Logo'
          style={{
            width: '40px',
            height: '40px',
            objectFit: 'contain',
          }}
        />
        <Typography variant='h4'>YAML Validator</Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <ToggleButtonGroup
          value={outputFormat}
          exclusive
          onChange={(e, newFormat) => newFormat && setOutputFormat(newFormat)}
          aria-label='output format'
        >
          <ToggleButton value='json'>JSON</ToggleButton>
          <ToggleButton value='python'>Python</ToggleButton>
          <ToggleButton value='canonical'>Canonical YAML</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          label='Validate YAML from URL'
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder='https://example.com/config.yaml'
        />
        <Button variant='contained' onClick={handleUrlValidate}>
          Validate URL
        </Button>
        <Button variant='outlined' onClick={loadExample}>
          Load Example
        </Button>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant='h6' gutterBottom>
            Input
          </Typography>
          <Editor
            height='400px'
            defaultLanguage='yaml'
            value={yamlInput}
            onChange={handleEditorChange}
            theme='vs-light'
            options={{
              minimap: { enabled: false },
              fontSize: 14,
            }}
          />
        </Paper>

        <Paper elevation={3} sx={{ p: 2 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
            }}
          >
            <Typography variant='h6'>Output</Typography>
            {!error && output && (
              <Tooltip title='Copy to clipboard'>
                <IconButton onClick={handleCopy} size='small'>
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          {error ? (
            <Box sx={{ color: 'error.main', whiteSpace: 'pre-wrap' }}>
              {error}
            </Box>
          ) : (
            <Editor
              height='400px'
              defaultLanguage={outputFormat === 'json' ? 'json' : 'python'}
              value={output}
              theme='vs-light'
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 14,
              }}
            />
          )}
        </Paper>
      </Box>
      <Snackbar
        open={showCopySuccess}
        autoHideDuration={2000}
        onClose={handleCloseCopySuccess}
        message='Copied to clipboard!'
      />
    </Container>
  );
};

export default YamlValidator;
