import React from 'react'
import { Link } from 'react-router-dom'

export const AuthPage = () => {
  return (
    <div className="d-grid gap-2 col-6 mx-auto" style={{marginTop: 16}}>
      <Link to="/user/signup" className="btn btn-primary" type="button">Sign up</Link>
      <Link to="/user/login" className="btn btn-primary" type="button">Login</Link>
      <Link to="/admin/login" className="btn btn-primary" type="button">Login as admin</Link>
    </div>
  )
}
