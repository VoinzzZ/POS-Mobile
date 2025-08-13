import { useEffect, useState } from "react"

function getGreeting() {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return 'Selamat Pagi'
    if (hour >= 12 && hour < 15) return 'Selamat Siang'
    if (hour >= 15 && hour < 18) return 'Selamat Sore'
    return 'Selamat Malam'
}

export default function Hallo() {
    const [greeting, setGreeting] = useState(getGreeting())

    useEffect(() => {
        const interval = setInterval(() => {
            setGreeting(getGreeting())
        }, 60000) // update setiap menit
        return () => clearInterval(interval)
    }, [])

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Hallo!</h1>
            <h2 className="text-xl font-semibold text-violet-700 mb-6">{greeting}</h2>
        </div>
    )
}