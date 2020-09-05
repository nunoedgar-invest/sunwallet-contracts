import React, { useState, useEffect } from 'react'
import {
  Card,
  FormControl,
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

import { connectWallet, getTxUrl } from './web3Utils'
import { sendRequestToBiconomy } from './biconomyService'
import {
  getUnblockTokensData,
  getTransferTokensData
} from './contractsService'
import './App.css'


const App = () => {
  const [approveRadio, setApproveRadio] = useState('sun')
  const [userWallet, setUserWallet] = useState()
  const [walletLoading, isWalletLoading] = useState(false)

  useEffect(() => {
    initWalletConnect()
  }, [])

  const initWalletConnect = () => {
    // Show loading icon
    isWalletLoading(true)

    connectWallet()
    .then((account) => {
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

  const _approveRadioChange = (event) => {
    setApproveRadio(event.target.value)
  }

  const handleApprove = async (event) => {
    event.preventDefault()

    try {
      const requestBody = await getUnblockTokensData(userWallet, approveRadio)
      const txHash = await sendRequestToBiconomy(requestBody)
      if (window.confirm('Sent!\n\nCheck transaction on Etherscan?')) {
        window.open(getTxUrl(txHash), '_blank')
      }
    } catch (error) {
      alert(error.message ? error.message : error)
    }
  }

  const handleTransfer = async (event) => {
    event.preventDefault()

    try {
      const amount = event.target.elements.amount.value
      const receiver = event.target.elements.receiver.value
      const requestBody = await getTransferTokensData(userWallet, receiver, amount, approveRadio)
      const txHash = await sendRequestToBiconomy(requestBody)
      if (window.confirm('Sent!\n\nCheck transaction on Etherscan?')) {
        window.open(getTxUrl(txHash), '_blank')
      }
    } catch (error) {
      console.log(error)
      alert(error.message ? error.message : error)
    }
  }

  return (
    <div className="App">
      <AppBar position="static" className="header">
        <Toolbar className="flex-space-between">
          <Typography variant="h6">
            SUN Meta-tx Dapp
          </Typography>
          {userWallet}
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm">
        {userWallet ?
          <>
            {/* Token approval */}
            <Card className="card approve">
              <CardContent>
                <Typography variant="h4" color="textPrimary" gutterBottom>
                  Select Token
                </Typography>
                <form onSubmit={handleApprove}>
                  <FormControl component="fieldset" className="fieldset">
                    <RadioGroup aria-label="gender" name="gender1" value={approveRadio} onChange={_approveRadioChange}>
                      <FormControlLabel value="sun" control={<Radio />} label="SUN" />
                      <FormControlLabel value="dai" control={<Radio />} label="DAI" />
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
                  <TextField id="receiver" name="receiver" label="To" />
                  <TextField id="amount" name="amount" label="Amount" />
                </FormControl>

                <Button type="submit" variant="outlined" color="primary">
                  Sign
                </Button>
              </form>
            </CardContent>
          </Card>
          </>
          :
          <Card className="card">
            <CardContent>
              <Typography variant="h4" color="textPrimary" gutterBottom>
                Please connect your wallet
              </Typography>
              {walletLoading &&
                <CircularProgress color="secondary" />
              }
            </CardContent>
          </Card>
        }
      </Container>
    </div>
  )
}

export default App
