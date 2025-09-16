"use client"

import { useState, useEffect, useCallback } from "react"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Wallet, Send, BookOpen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

import { CONTRACT_ADDRESS, GUESTBOOK_ABI, NETWORK_CONFIG } from "@/lib/contract"

interface Message {
  sender: string
  content: string
  timestamp: number
  index: number
}

export default function DigitalGuestbook() {
  const [account, setAccount] = useState<string>("")
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Add Conflux eSpace testnet to MetaMask
  const addNetwork = async () => {
    if (typeof window.ethereum === "undefined") return

    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [NETWORK_CONFIG],
      })
    } catch (error) {
      console.error("Error adding network:", error)
    }
  }

  // Switch to Conflux eSpace testnet
  const switchNetwork = async () => {
    if (typeof window.ethereum === "undefined") return

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}` }],
      })
    } catch (error: any) {
      if (error.code === 4902) {
        // Network not added, add it
        await addNetwork()
      } else {
        console.error("Error switching network:", error)
      }
    }
  }

  // Connect to MetaMask wallet
  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      toast({
        title: "MetaMask not found",
        description: "Please install MetaMask to use this application.",
        variant: "destructive",
      })
      return
    }

    setIsConnecting(true)
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send("eth_requestAccounts", [])
      
      // Check if we're on the correct network
      const network = await provider.getNetwork()
      if (Number(network.chainId) !== NETWORK_CONFIG.chainId) {
        await switchNetwork()
      }

      const signer = await provider.getSigner()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, GUESTBOOK_ABI, signer)

      setProvider(provider)
      setAccount(accounts[0])
      setContract(contract)

      toast({
        title: "Wallet connected",
        description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
      })

      // Set up event listener for new messages
      contract.on("MessageAdded", (sender, id, content, timestamp) => {
        loadMessages()
        toast({
          title: "New message posted!",
          description: `Message from ${sender.slice(0, 6)}...${sender.slice(-4)}`,
        })
      })
    } catch (error) {
      console.error("Error connecting wallet:", error)
      toast({
        title: "Connection failed",
        description: "Failed to connect to MetaMask. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  // Load all messages from the contract
  const loadMessages = useCallback(async () => {
    if (!contract) return

    setIsLoading(true)
    try {
      const messageCount = await contract.getMessageCount()
      const loadedMessages: Message[] = []

      for (let i = 0; i < messageCount; i++) {
        const [sender, content, timestamp] = await contract.getMessage(i)
        loadedMessages.push({
          sender,
          content,
          timestamp: Number(timestamp),
          index: i,
        })
      }

      // Sort messages by timestamp (latest first)
      loadedMessages.sort((a, b) => b.timestamp - a.timestamp)
      setMessages(loadedMessages)
    } catch (error) {
      console.error("Error loading messages:", error)
      toast({
        title: "Error loading messages",
        description: "Failed to load messages from the blockchain.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [contract, toast])

  // Post a new message to the contract
  const postMessage = async () => {
    if (!contract || !newMessage.trim()) return

    setIsPosting(true)
    try {
      const tx = await contract.addMessage(newMessage.trim())

      toast({
        title: "Transaction submitted",
        description: "Your message is being posted to the blockchain...",
      })

      await tx.wait()
      setNewMessage("")

      toast({
        title: "Message posted!",
        description: "Your message has been successfully added to the guestbook.",
      })

      // Reload messages after successful post
      await loadMessages()
    } catch (error) {
      console.error("Error posting message:", error)
      toast({
        title: "Failed to post message",
        description: "There was an error posting your message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsPosting(false)
    }
  }

  // Format timestamp to readable date
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  // Shorten address for display
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Load messages when contract is available
  useEffect(() => {
    if (contract) {
      loadMessages()
    }
  }, [contract, loadMessages])

  // Handle account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length === 0) {
          setAccount("")
          setProvider(null)
          setContract(null)
          setMessages([])
        } else {
          setAccount(accounts[0])
        }
      })
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged")
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">📖 Digital Guestbook</h1>
          </div>

          {!account ? (
            <Button onClick={connectWallet} disabled={isConnecting} className="bg-indigo-600 hover:bg-indigo-700">
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Wallet
                </>
              )}
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="px-3 py-1">
                <Wallet className="mr-1 h-3 w-3" />
                {shortenAddress(account)}
              </Badge>
            </div>
          )}
        </div>

        {/* Message Input */}
        {account && (
          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <h2 className="text-xl font-semibold">Leave a Message</h2>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  placeholder="Write your message here..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                  maxLength={280}
                  onKeyPress={(e) => e.key === "Enter" && !isPosting && postMessage()}
                />
                <Button
                  onClick={postMessage}
                  disabled={!newMessage.trim() || isPosting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isPosting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Post Message
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{newMessage.length}/280 characters</p>
            </CardContent>
          </Card>
        )}

        {/* Messages List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Messages ({messages.length})</h2>
            {isLoading && <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />}
          </div>

          {!account ? (
            <Card className="text-center py-12">
              <CardContent>
                <Wallet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Connect Your Wallet</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Connect your MetaMask wallet to view and post messages to the guestbook.
                </p>
              </CardContent>
            </Card>
          ) : messages.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Messages Yet</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Be the first to leave a message in this digital guestbook!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {messages.map((message) => (
                <Card key={message.index} className="shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline" className="font-mono text-xs">
                        {shortenAddress(message.sender)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{formatTimestamp(message.timestamp)}</span>
                    </div>
                    <p className="text-gray-900 dark:text-white leading-relaxed">{message.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Powered by Conflux eSpace Testnet • Built with Next.js & ethers.js</p>
          <p className="mt-1">Contract: {CONTRACT_ADDRESS}</p>
        </div>
      </div>
    </div>
  )
}
