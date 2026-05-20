import { BrowserRouter } from 'react-router-dom'
import { App as AntdApp } from 'antd'
import Router from './router'

function App() {
  return (
    <BrowserRouter>
      <AntdApp>
        <Router />
      </AntdApp>
    </BrowserRouter>
  )
}

export default App

