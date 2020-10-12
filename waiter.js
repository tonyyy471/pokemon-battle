class Waiter {
    static wait(miliseconds = 0) {
        return new Promise((resolve) => {
            setTimeout(resolve, miliseconds)
        })
    }
}