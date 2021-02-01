(function () {
    var modal = document.getElementById("video-modal");

    if(!modal) return;

    var btn = document.querySelector('.top__video');

    var close = modal.querySelector('.close');


    const stopVideo = function (element) {
        const iframe = element.querySelector('iframe');
        const video = element.querySelector('video');

        if (iframe) {
            //remove autoplay
            iframe.setAttribute('allow', '');
            iframe.src = iframe.src.replace('&autoplay=1', '');
        }
        if (video) {
            video.pause();
        }
    };

    btn.addEventListener('click', function (e) {
        e.preventDefault();
        modal.classList.add('modal__show');
    });

    close.addEventListener('click', function (e) {
        e.preventDefault();
        modal.classList.remove('modal__show');
        stopVideo(modal);
    });

    window.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.classList.remove('modal__show');
            stopVideo(modal);
        }
    });


}());