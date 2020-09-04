(function() {

    const canv = $('#canv');
    const form = $('form');
    const hiddenSig = $('#sig');
    const ctx = canv[0].getContext('2d');

    /////////// TEMPORARY 'SIGNATURE' //////////
    canv.on('mousedown', () => {

        ctx.strokeStyle = 'magenta';

        ctx.beginPath();
        ctx.moveTo(50, 50);
        ctx.lineTo(100, 100);
        ctx.lineTo(200, 70);
        ctx.stroke();

    });
    

    //////////// SUBMIT EVENT ////////////
    form.on('submit', () => {
        // assign the camvas URL as a value to the input field
        hiddenSig.val(canv[0].toDataURL());
        // console.log(hiddenSig.val());
    });

})();