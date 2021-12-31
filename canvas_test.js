const canvas = document.getElementById('canvas')
console.log(canvas.width)
const ctx = canvas.getContext('2d')
ctx.font = "bold 24px  Georgia ";
ctx.fillStyle = "#000"

ctx.strokeStyle = ""
ctx.lineWidth = 3
ctx.fillRect(0, 0, canvas.width, canvas.height)
// ctx.fillStyle = "#fff"
// ctx.fillRect(167, 130, 67, 50)
// ctx.font = "bold 24px Georgia";
// ctx.fillStyle = "#000"
// ctx.fillText('示例字幕', 120, 170)
ctx.fillStyle = "#fff"
ctx.fillRect(100, 130, 120, 100)
ctx.fillStyle = "#000"
ctx.fillText('示例字幕', 112, 190)

canvas.addEventListener('click', e => {
    const clipDOM = document.createElement('div')
    clipDOM.style.width = '60px'
    clipDOM.style.height = '50px'
    clipDOM.style.position = 'absolute'
    clipDOM.style.left = '58px'
    clipDOM.style.top = '73px'
    clipDOM.style.background = 'rgba(0,0,0,.3)'
    const container = document.querySelector('.canvas-container')
    container.appendChild(clipDOM)
    clipDOM.textContent = '示例字幕'
    clipDOM.classList.add('text')

})


const canvas2 = document.getElementById('canvas2')
const ctx2 = canvas2.getContext('2d')

ctx2.strokeStyle = "#000"
ctx2.strokeStyle = ""
ctx2.lineWidth = 3
ctx2.fillRect(0, 0, canvas2.width, canvas2.height)
ctx2.fillStyle = "#fff"
ctx2.fillRect(100, 130, 67, 50)
ctx2.font = "bold 12px Georgia";
ctx2.fillStyle = "#000"
ctx2.fillText('示例字幕', 110, 160)


canvas2.addEventListener('click', e => {
    const clipDOM = document.createElement('div')
    clipDOM.style.width = '68px'
    clipDOM.style.height = '50px'
    clipDOM.style.position = 'absolute'
    clipDOM.style.left = '100px'
    clipDOM.style.top = '130px'
    clipDOM.style.background = 'rgba(0,0,0,.3)'
    clipDOM.textContent = '示例字幕'
    clipDOM.classList.add('text')

    const container2 = document.querySelector('.canvas-container2')
    container2.appendChild(clipDOM)

})

canvas2.addEventListener('mousedown', e => {
    canvas2.addEventListener('mousemove', e=>{
        
    })
    canvas2.addEventListener('mouseup', e=>{

    })
})