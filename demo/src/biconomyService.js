const axios = require('axios')
const {
  biconomyApiKey,
  biconomyUrl
} = require('./config')

export const sendRequestToBiconomy = async (body) => {
  try {
    const headerSettings = {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': biconomyApiKey,
      },
    }

    const response = await axios.post(biconomyUrl, JSON.stringify(body), headerSettings)
    return response.data.txHash
  } catch (error) {
    throw error
  }
}