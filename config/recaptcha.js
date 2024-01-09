const config = useRuntimeConfig()

const recaptchaCheck = async(token) => {
    if (!token) {
      return false;
    }
    const response = await $fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${config.RECAPTCHA_SERVER_KEY}&response=${token}`
    );
    //console.log("Recaptcha: ", response, config.RECAPTCHA_SCORE);
    return response.success && response.score >= config.RECAPTCHA_SCORE;
}

export default recaptchaCheck