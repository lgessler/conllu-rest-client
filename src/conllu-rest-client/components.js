import Api from './api';
import './components.css';
import React, { useState, useEffect } from 'react';
import {
  Button, Stack, TextField, Box, Typography, Container, List, ListItem, ListItemButton, ListItemText,
  Skeleton, LinearProgress, Pagination
} from '@mui/material';
import { CallSplit, Merge } from '@mui/icons-material';
import { useLocalStorage } from "./util";

// A top-level component that contains setup needed for all subcomponents and a login flow
export default function Base() {
  const [token, setToken] = useLocalStorage("token", "");
  const [tokenValid, setTokenValid] = useState(false);
  const [api, setApi] = useState(new Api("http://localhost:3000/api", token));

  // a little wasteful, probably want to debounce all this or something
  useEffect(async () => {
    const result = await api.checkToken(token);
    setTokenValid(result.ok);
    setApi(new Api("http://localhost:3000/api", token));
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
  const [docTotal, setDocTotal] = useState([]);
  const [queryParams, setQueryParams] = useState({ limit: 25, page: 1 });
  const [docId, setDocId] = useState(null);
  useEffect(async () => {
    const result = await props.api.queryDocuments((queryParams.page - 1) * queryParams.limit, queryParams.limit);
    setDocs(result.docs);
    setDocTotal(result.total);
  }, [queryParams]);

  if (docs.length === 0) {
    return (
        <Container maxWidth="sm">
          <Stack spacing={6} my={5}>
              <LoadPlaceholder />
          </Stack>
        </Container>
    )
  } else {
    return (
        docId === null
            ? <Container maxWidth="xs">
              <Stack spacing={2} justifyContent="center">
                <Typography variant="h4">Documents</Typography>
                <List dense>
                  {docs.map(d => (
                      <ListItem key={d.id} onClick={() => setDocId(d.id)}>
                        <ListItemButton>
                          <ListItemText primary={d.name} secondary={d.id} />
                        </ListItemButton>
                      </ListItem>
                  ))}
                </List>
                <Pagination
                    count={Math.ceil(docTotal / queryParams.limit)}
                    page={queryParams.page}
                    onChange={(e, v) => setQueryParams({...queryParams, page: v})}
                />
              </Stack>
            </Container>
            : <Document api={props.api} id={docId} back={() => setDocId(null)} />
    )
  }
}

function Document(props) {
  const api = props.api;
  const [doc, setDoc] = useState(null);
  const [busy, setBusy] = useState(false);
  const [insideToken, setInsideToken] = useState(false);
  const leaveToken = () => setInsideToken(false);
  const enterToken = () => setInsideToken(true);

  useEffect(async () => {
    const data = await api.getDocument(props.id);
    await setDoc(data);
  }, [props.id, busy])

  function Sentences(props) {
    return <>
      <Typography variant="h4">{props.name}</Typography>
      <Typography variant="caption">[{props.id}]</Typography>
      <div>{props.sentences.map(Sentence)}</div>
    </>
  }

  function Sentence(props) {
    async function merge(e) {
      e.preventDefault()
      if (!busy && !insideToken) {
        setBusy(true);
        const result = await api.mergeSentenceLeft(props.id);
        setBusy(false);
      }
    }
    return (
        <div key={props.id} className={insideToken ? "sentence" : "sentence sentence--hoverable"} onClick={merge}>
          <span className="sentence-icon"><Merge fontSize="small" /></span>
          {props.tokens.map((v, i) => Token({...v, index: i}))}
        </div>
    )
  }

  function Token(props) {
    async function split(e) {
      e.preventDefault();
      // Only proceed if another action isn't in progress
      if (!busy) {
        setBusy(true);
        const result = await api.splitSentence(props.id);
        setBusy(false);
      }
    }
    return <span className="token-area"
                 title="Split sentence"
                 onClick={split}
                 key={props.id}
                 onMouseEnter={enterToken}
                 onMouseLeave={leaveToken}>
      {(props.index > 0) ? <> <span className="token-button"> <CallSplit fontSize="small" /></span></> : ""}
      <span className="token">{props.form.value}</span>
    </span>
  }

  async function download(e) {
    e.preventDefault();
    const result = await api.downloadConlluFile(props.id);
    const blob = await result.blob();
    const url = await URL.createObjectURL(blob);
    Object.assign(document.createElement('a'), {
      href: url,
      download: doc.name + '.conllu',
    }).click();
  }

  return (
      <Container maxWidth="md" style={{cursor: busy ? "progress" : "initial"}}>
        {busy ? <LinearProgress /> : <LinearProgress style={{visibility: "hidden"}} />}
        <Stack spacing={2} my={5}>
          {doc === null ? <LoadPlaceholder />
              : <>
                {Sentences(doc)}
                <Button onClick={props.back} fullWidth>Back</Button>
                <Button onClick={download} fullWidth>Download</Button>
              </>}
        </Stack>
      </Container>
  )
}

function LoadPlaceholder() {
    return <>
      <LinearProgress />
      <Skeleton variant="rectangular" height={24} />
      <Skeleton variant="rectangular" height={24} />
      <Skeleton variant="rectangular" height={24} />
      <Skeleton variant="rectangular" height={24} />
      <Skeleton variant="rectangular" height={24} />
    </>;
}