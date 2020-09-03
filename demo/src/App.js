import React, { useState } from 'react';
import {
  Card,
  FormControl,
  FormLabel,
  Button,
  Radio,
  RadioGroup,
  CardContent,
  Typography,
  FormControlLabel,
  TextField,
  Container,
  AppBar,
  CircularProgress,
  Toolbar,
} from '@material-ui/core'


import { connectWallet } from './web3Utils'
import './App.css';


const App = () => {
  const [approveRadio, setApproveRadio] = useState('SUN');
  const [userWallet, setUserWallet] = useState();
  const [walletLoading, isWalletLoading] = useState(false);

  const _approveRadioChange = (event) => {
    setApproveRadio(event.target.value);
  }

  const handleApprove = () => {
      // permit logic
  }

  const handleTransfer = () => {
      // permit logic
  }

  const handleWalletConnect = () => {
    // Show loading icon
    isWalletLoading(true)

    connectWallet()
    .then(({ account }) => {
      setUserWallet(account)
    })
    .catch(error => {
      alert(error.message)
    })
    .finally(() => {
      // Hide loading icon
      isWalletLoading(false)
    })
  }

  const walletSection = () => {
    if (walletLoading) {
      return (
        <CircularProgress color="secondary" />
      )
    }

    if (!userWallet) {
      return (
        <Button color="inherit" onClick={handleWalletConnect}>
          Connect Wallet
        </Button>
      )
    }

    return userWallet
  }

  return (
    <div className="App">
      <AppBar position="static" className="header">
        <Toolbar className="flex-space-between">
          <Typography variant="h6">
            SUN Meta-tx Dapp
          </Typography>
          { walletSection() }
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm">
        {/* Token approval */}

        <Card className="card approve">
          <CardContent>
            <Typography variant="h4" color="textPrimary" gutterBottom>
              Select Token
            </Typography>
            <form onSubmit={handleApprove}>
              <FormControl component="fieldset" className="fieldset">
                <FormLabel component="legend">You want to swap</FormLabel>
                <RadioGroup aria-label="gender" name="gender1" value={approveRadio} onChange={_approveRadioChange}>
                  <FormControlLabel value="SUN" control={<Radio />} label="SUN" />
                  <FormControlLabel value="DAI" control={<Radio />} label="DAI" />
                  <FormControlLabel value="Other" control={<Radio />} label="Other" />
                </RadioGroup>

                {approveRadio === "Other" && (
                  <TextField id="other-token" label="Token Address" />
                )}

                <Button type="submit" variant="outlined" color="primary">
                  Approve
                </Button>
              </FormControl>
            </form>
          </CardContent>
        </Card>

        {/* Token transfer */}
        <Card className="card">
          <CardContent>
            <Typography variant="h4" color="textPrimary" gutterBottom>
              Transfer
            </Typography>
            <form onSubmit={handleTransfer} noValidate autoComplete="off">
              <FormControl component="fieldset" className="fieldset">
                <TextField id="receiver" label="Amount" />
                <TextField id="amount" label="To" />
              </FormControl>

              <Button type="submit" variant="outlined" color="primary">
                Sign
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}

export default App;
