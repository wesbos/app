import axios from 'axios';

function ajaxHeart(e) {
  e.preventDefault();
  console.log('Goin!');
  axios
    .post(this.action)
    .then(res => {
      const isHearted = this.heart.classList.toggle('heart__button--hearted');

      if (isHearted) {
        this.heart.classList.add('heart__button--float');
        setTimeout(() => this.heart.classList.remove('heart__button--float'), 2500);
      }

      // update the hearts HTML
      document.querySelector('.heart-count').textContent = res.data.hearts.length;
    })
    .catch(console.error)
}

export default ajaxHeart;
