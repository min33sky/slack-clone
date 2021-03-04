import axios from 'axios';

function fetcher(url: string) {
  /**
   * ? withCredentials: true
   * 프론트앤드와 백앤드의 주소가 다를 경우 프론트앤드에 쿠키가 생성이 안되고
   * 프론트앤드에서 백앤드로 쿠키를 전송할 수도 없다. 위의 설정으로 쿠키 문제 해결 가능
   */
  return axios.get(url, { withCredentials: true }).then((response) => response.data);
}

export default fetcher;
