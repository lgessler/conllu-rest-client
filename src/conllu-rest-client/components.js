import Api from './api';
import React, { useState, useEffect } from 'react';
import {
  Button, Stack, TextField, Box, Typography, Container, List, ListItem, ListItemButton, ListItemText,
  Skeleton, LinearProgress
} from '@mui/material';
import { useLocalStorage } from "./util";

// A top-level component that contains setup needed for all subcomponents and a login flow
export default function Base() {
  const [token, setToken] = useLocalStorage("token", "");
  const [tokenValid, setTokenValid] = useState(false);
  const [api, setApi] = useState(new Api("http://localhost:3000/api", token));

  // a little wasteful, probably want to debounce all this or something
  useEffect(() => {
    api.checkToken(token).then(result => {
      setTokenValid(result.ok);
      setApi(new Api("http://localhost:3000/api", token));
    })
  }, [token]);

  if (!tokenValid) {
    return (
        <Box my={4}>
          <Container maxWidth="sm">
            <Stack spacing={2}>
              <Typography variant="h4">Login</Typography>
              <Typography variant="subtitle1">Enter the secret token you received from your admin.</Typography>
              <TextField
                  fullWidth
                  label="Secret Token"
                  onChange={(e) => setToken(e.target.value)}
                  value={token}
              />
            </Stack>
          </Container>
        </Box>
    )
  } else {
    return (
        <Box my={4}>
          <DocumentSelection api={api}></DocumentSelection>
        </Box>
    )
  }

}



function DocumentSelection(props) {
  const [docs, setDocs] = useState([]);
  const [queryParams, setQueryParams] = useState({ limit: 25, offset: 0 });
  const [docId, setDocId] = useState(null);
  useEffect(() => {
    props.api.queryDocuments(queryParams.offset, queryParams.limit)
        .then(data => setDocs(data));
  }, queryParams);

  if (docs.length === 0) {
    return (
        <Container maxWidth="sm">
          <Stack spacing={6} my={5}>
            <LinearProgress />
            <Skeleton variant="rectangular" height={36} />
            <Skeleton variant="rectangular" height={36} />
            <Skeleton variant="rectangular" height={36} />
            <Skeleton variant="rectangular" height={36} />
            <Skeleton variant="rectangular" height={36} />
          </Stack>
        </Container >
    )
  } else {
    return (
        docId === null
            ? <Container maxWidth="xs">
              <Stack spacing={2}>
                <Typography variant="h4">Documents</Typography>
                <List>
                  {docs.map(d => (
                      <ListItem key={d.id} onClick={() => setDocId(d.id)}>
                        <ListItemButton>
                          <ListItemText primary={d.name} />
                        </ListItemButton>
                      </ListItem>
                  ))}
                </List>
              </Stack>
            </Container>
            : <Document api={props.api} id={docId} back={() => setDocId(null)} />
    )
  }
}


function Document(props) {
  const [doc, setDoc] = useState(null);
  useEffect(() => {
    props.api.getDocument(props.id).then(data => setDoc(data));
  }, props.id)

  function renderDocument(props) {
    return <>
      <Typography variant="h4">{props.name}</Typography>
      {props.sentences.map(renderSentence)}
    </>
  }

  function renderSentence(props, i) {
    const style={
      backgroundColor: i % 2 === 0 ? "#dcefff" : "#ffffff",
      padding: "0.8em",
      borderRadius: "4px",
      marginTop: 0
    };
    return (
        <div style={style}>{props.tokens.map(renderToken)}</div>
    )
  }

  function renderToken(props) {
    return <> <span>{props.form.value}</span></>
  }

  async function download(e) {
    e.preventDefault();
    const result = await props.api.downloadConlluFile(props.id);
    const blob = await result.blob();
    const url = await URL.createObjectURL(blob);
    Object.assign(document.createElement('a'), {
      href: url,
      download: doc.name + '.conllu',
    }).click();
  }

  return (
      <Container maxWidth="md">
        <Stack spacing={2} my={5}>
          {doc === null ?
              <>
                <LinearProgress />
                <Skeleton variant="rectangular" height={24} />
                <Skeleton variant="rectangular" height={24} />
                <Skeleton variant="rectangular" height={24} />
                <Skeleton variant="rectangular" height={24} />
                <Skeleton variant="rectangular" height={24} />
              </>
              : <>
                {renderDocument(doc)}
                <Button onClick={props.back} fullWidth>Back</Button>
                <Button onClick={download} fullWidth>Download</Button>
              </>}
        </Stack>
      </Container>
  )
}
