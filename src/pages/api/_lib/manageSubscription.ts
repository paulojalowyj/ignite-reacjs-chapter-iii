import { query } from 'faunadb'
import { fauna } from "../../../services/fauna";
import { stripe } from '../../../services/stripe';

export async function saveSubscription(
    subscriptionId: string,
    customerId: string,
    createAction = false,
) {
    //Buscar o usuário no FaunaDB com o id {customerId}
    const userRef = await fauna.query(
        query.Select(
            "ref", query.Get(
                query.Match(
                    query.Index('user_by_stripe_customer_id'),
                    customerId
                )
            )
        )
    )
    //Buscar Dados da Subscription no Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    //Salvar os dados da subscription do usuário no FaunaDB
    const subscriptionData = {
        id: subscription.id,
        userId: userRef,
        status: subscription.status,
        price_id: subscription.items.data[0].price.id,

    }

    if (createAction) {
        await fauna.query(
            //Adicionar validação se o usuário ja é cadastrado
            query.Create(
                query.Collection('subscriptions'),
                { data: subscriptionData }
            )
        )
    } else {
        await fauna.query(
            query.Replace(
                query.Select(
                    "ref",
                    query.Get(
                        query.Match(query.Index('subscription_by_id'),
                            subscriptionId,
                        )
                    )
                ), { data: subscriptionData, }
            )
        )
    }
}