import React from 'react'
import './ProgressIndicator.css';

export const ProgressIndicator = (props) => {
    console.log("Inside progress indicator");
    return (
        <>
            <div className="d-flex justify-content-center" id='indicator'>
                <div className="spinner-border" role="status">
                </div>
                <div style={{width: 16}}></div>
                <h3>{props.content}</h3>
            </div>
        </>
    )
}
