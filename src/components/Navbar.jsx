import React from 'react'
import {Link} from "react-router-dom"

export const Navbar = () => {
  return (
    <nav className="navbar navbar-dark bg-primary">
  <div className="container-fluid">
    <Link className="navbar-brand" to="/"><h2>ElectWise</h2></Link>
  </div>
</nav>
  )
}
