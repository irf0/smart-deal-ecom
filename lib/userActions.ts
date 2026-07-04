interface UpsertUserParams {
    name: string
    city: string
    whatsappNumber: string
}

export async function upsertUser(
    supabase: any,
    { name, city, whatsappNumber }: UpsertUserParams
) {
    const { data, error } = await supabase
        .from('users')
        .upsert(
            {
                name,
                city,
                whatsapp_number: whatsappNumber,
            },
            { onConflict: 'whatsapp_number' }
        )
        .select('id')
        .single()

    if (error) throw new Error(error.message)

    return data.id as string
}