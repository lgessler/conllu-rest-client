import Api from './api';
import React, { useState, useEffect } from 'react';
import {
  Button, Stack, TextField, Box, Typography, Container, List, ListItem, ListItemButton, ListItemText, 
  Skeleton, LinearProgress
} from '@mui/material';

// A top-level component that contains setup needed for all subcomponents
// and a login flow
export default function Base() {
  const [api, setApi] = useState(null);
  const [token, setToken] = useState("");
  function makeApi(token) {
  }
  function handleSubmit(e) {
    e.preventDefault();
    return setApi(new Api("http://localhost:3000/api/conllu", token));
  }

  if (api === null) {
    return (
      <Box my={4}>
        <Container maxWidth="sm">
          <Stack spacing={2}>
            <Typography variant="h4">Login</Typography>
            <Typography variant="subtitle1">Enter the secret token you received from your admin.</Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Secret Token"
                onChange={(e) => setToken(e.target.value)}
                value={token}
              />
              <Button variant="contained" onClick={handleSubmit} fullWidth>
                Submit
              </Button>
            </form>
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

  console.log(doc);

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
          </>}
      </Stack>
    </Container>
  )
}
