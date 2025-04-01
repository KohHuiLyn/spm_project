'use client'

// import {createClient} from "@supabase/supabase-js"
import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"

export default function clientComponent() {
    const [user, setUser] = useState(null)

    useEffect(() => {
        async function getUser(){
            const supabase = createClient()
            const{data, error} = await supabase.auth.getUser()
            if (error || !data?.user) {
                console.log('no user')
            } else {
                setUser(data.user)
            }
        }
        getUser()
    }, [])
}