import React from 'react';

const PrintReceipt = () => {
const handlePrint = () => {
    const printWindow = window.open('', '', 'width=300,height=600');
    printWindow.document.write(`
        <html>
        <head>
            <title>Receipt</title>
            <style>
                @media print {
                    body { font-family: monospace; width: 80mm; }
                }
            </style>
        </head>
        <body onload="window.print(); window.close();">
            <h2>*** Receipt ***</h2>
            <p>Item 1        $10.00</p>
            <p>Item 2        $20.00</p>
            <hr />
            <p>Total: $30.00</p>
        </body>
        </html>
    `);
    printWindow.document.close();
};


    return (
        <div>
            <div id="receipt" style={{ display: 'none' }}>
                <h2>*** Receipt ***</h2>
                <p>Item 1        $10.00</p>
                <p>Item 2        $20.00</p>
                <hr />
                <p>Total: $30.00</p>
            </div>
            <button onClick={handlePrint}>Print Receipt</button>
        </div>
    );
};


export default PrintReceipt;
