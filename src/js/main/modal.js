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

    function stopScrolling() {
        document.body.style.overflow = "hidden";
        document.body.style.height = "100%";
    }

    function resumeScrolling() {
        document.body.style.overflow = "auto";
        document.body.style.height = "auto";
    }

    btn.addEventListener('click', function (e) {
        e.preventDefault();
        modal.classList.add('modal__show');
        stopScrolling();
    });

    close.addEventListener('click', function (e) {
        e.preventDefault();
        modal.classList.remove('modal__show');
        stopVideo(modal);
        resumeScrolling();
    });

    window.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.classList.remove('modal__show');
            stopVideo(modal);
            resumeScrolling();
        }
    });


}());
