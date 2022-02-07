import pytest
from brownie import ETH_ADDRESS


def test_multiple_coins(
    zap,
    factory,
    base_swap,
    base_token,
    meta_swap,
    meta_token,
    underlying_coins,
    amounts_underlying,
    alice,
    bob,
    balances_do_not_change,
    zap_has_zero_amounts,
):
    with balances_do_not_change([ETH_ADDRESS, meta_token, base_token], alice):
        calculated = zap.calc_token_amount(meta_swap, amounts_underlying)
        lp_received = zap.add_liquidity(
            meta_swap, amounts_underlying, 0.99 * calculated, False, bob, {"from": alice}
        ).return_value

    zap_has_zero_amounts()

    assert meta_token.balanceOf(bob) == lp_received > 0
    assert abs(lp_received - calculated) <= 1


@pytest.mark.parametrize("idx", range(4))
def test_one_coin(
    zap,
    meta_swap,
    meta_token,
    base_token,
    underlying_coins,
    amounts_underlying,
    alice,
    bob,
    balances_do_not_change,
    zap_has_zero_amounts,
    idx,
):
    with balances_do_not_change([ETH_ADDRESS, meta_token, base_token], alice):
        amounts = [0] * len(amounts_underlying)
        amounts[idx] = amounts_underlying[idx]
        calculated = zap.calc_token_amount(meta_swap, amounts)
        lp_received = zap.add_liquidity(
            meta_swap, amounts, 0.99 * calculated, False, bob, {"from": alice}
        ).return_value

    zap_has_zero_amounts()

    assert meta_token.balanceOf(bob) == lp_received > 0
    assert abs(lp_received - calculated) <= 1


def test_multiple_coins_use_eth(
    zap,
    meta_swap,
    meta_token,
    base_token,
    underlying_coins,
    amounts_underlying,
    alice,
    bob,
    balances_do_not_change,
    zap_has_zero_amounts,
):
    initial_balance = alice.balance()
    with balances_do_not_change([underlying_coins[-1], meta_token, base_token], alice):
        calculated = zap.calc_token_amount(meta_swap, amounts_underlying)
        lp_received = zap.add_liquidity(
            meta_swap,
            amounts_underlying,
            0.99 * calculated,
            True,
            bob,
            {"from": alice, "value": amounts_underlying[-1]},
        ).return_value

    zap_has_zero_amounts()

    assert alice.balance() == initial_balance - amounts_underlying[-1]

    assert meta_token.balanceOf(bob) == lp_received > 0
    assert abs(lp_received - calculated) <= 1


def test_one_coin_use_eth(
    zap,
    meta_swap,
    meta_token,
    base_token,
    underlying_coins,
    amounts_underlying,
    alice,
    bob,
    balances_do_not_change,
    zap_has_zero_amounts,
):
    initial_balance = alice.balance()
    amounts = [0] * len(amounts_underlying)
    amounts[-1] = amounts_underlying[-1]
    with balances_do_not_change(underlying_coins + [meta_token, base_token], alice):
        calculated = zap.calc_token_amount(meta_swap, amounts)
        lp_received = zap.add_liquidity(
            meta_swap, amounts, 0.99 * calculated, True, bob, {"from": alice, "value": amounts[-1]}
        ).return_value

    zap_has_zero_amounts()

    assert alice.balance() == initial_balance - amounts[-1]

    assert meta_token.balanceOf(bob) == lp_received > 0
    assert abs(lp_received - calculated) <= 1
