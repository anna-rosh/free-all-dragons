/* eslint-disable indent */
(function() {

    const canv = $('#canv');
    const hiddenSig = $('#sig');
    const ctx = canv[0].getContext('2d');

    /////////////////// C A N V A S ////////////////////
    
    let x, y;

    //////// EVENTS //////
    canv.on('mousedown', function fn(e) {

        findPosition(e);
        
        $(e.currentTarget).on('mousemove', (e) => {
            const { top: posTop, left: posLeft } = canv.offset();
            // reasign values of x & y and draw a line to the new coordinates
            x = e.clientX - posLeft;
            y = e.clientY - posTop;

            ctx.lineTo(x, y);
            ctx.stroke();
            // every movement of mouse find a new position
            findPosition(e);

        });

    })
    .on('mouseup', (e) => {
        // stop drawing
        $(e.currentTarget).off('mousemove');
        
        let signature = canv[0].toDataURL();
        console.log(signature);
        hiddenSig.val(signature);
    });

    // EVENTHANDLER
    function findPosition(e) {
        // find out where on the page the canvas sits
        const { top: posTop, left: posLeft } = canv.offset();

        ctx.strokeStyle = 'magenta';
        // find the current coordinates 
        x = e.clientX - posLeft;
        y = e.clientY - posTop;

        ctx.beginPath();
        ctx.moveTo(x, y);
    }

})();