import Header from './Header'
import React, { Component, ReactNode } from 'react'

const layoutStyle = {
  margin: 20,
  padding: 20,
  border: '1px solid #DDD'
}

type Props = {
  children: ReactNode
}

export default function Layout(props: Props) {
  return (
    <div style={layoutStyle}>
      <Header />
      {props.children}
    </div>
  )
}