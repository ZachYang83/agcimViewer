const u = JSON.parse(localStorage.getItem('user'));
const user = {
    state: {
        userId: undefined,
        userName: undefined
    },
    mutations: {
        handleUserName: (state, userName) => {
            state.userName = userName
        },
        handleUserId: (state, userId) => {
            state.userId = userId
        }
    }, 
}

export default user