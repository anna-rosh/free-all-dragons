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
    

    form.on('submit', () => {
        console.log('THE FORM WAS SUBMITTED');
        hiddenSig.val(canv[0].toDataURL());
    });

})();