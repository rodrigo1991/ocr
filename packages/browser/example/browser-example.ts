import Ocr from '@gutenye/ocr-browser'

async function main() {
  const ocr = await Ocr.create({
    isDebug: true,
    models: {
      detectionPath: '/assets/mobile_det.onnx',
      recognitionPath: '/assets/mobile_rec.onnx',
      dictionaryPath: '/assets/ppocrv5_dict.txt',
    },
  })
  document.querySelector('.hide')!.style.visibility = 'visible'
  document.querySelector('#title')!.textContent = 'OCR is ready'

  createApp(async ({ imageUrl }) => {
    const startTime = new Date().valueOf()
    const result = await ocr.detect(imageUrl)
    const duration = new Date().valueOf() - startTime

    return {
      text: result.texts.map((v) => `${v.mean.toFixed(2)} ${v.text}`).join('\n'),
      duration,
    }
  })
}

function createApp(
  runOcr: (params: {
    imageUrl: string
  }) => Promise<{ text: string; duration: number }>,
) {
  const resultTextEl = document.querySelector('#result-text') as HTMLDivElement
  const performanceEl = document.querySelector('#performance') as HTMLDivElement
  const resultImageEl = document.querySelector('#result-image') as HTMLImageElement
  const inputImageEl = document.querySelector('#input-image') as HTMLImageElement
  inputImageEl.addEventListener('change', async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) {
      return
    }
    const imageUrl = URL.createObjectURL(file)
    await handleChange(imageUrl)
  })
  const handleChange = async (imageUrl: string) => {
    document.querySelectorAll('canvas').forEach((el) => el.remove())
    resultTextEl.textContent = 'Working in progress...'
    resultImageEl.setAttribute('src', imageUrl)
    const { text, duration } = await runOcr({ imageUrl })
    resultTextEl.textContent = text
    performanceEl.textContent = `Performance: ${duration}ms (Close Chrome DevTools to get accureate result)`
  }

  if (process.env.DEFAULT_IMAGE_PATH) {
    handleChange(process.env.DEFAULT_IMAGE_PATH)
  }
}

main()
