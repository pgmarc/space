import {
  DetailedFeatureEvaluation,
  EvaluationContext,
  PricingContext,
  SimpleFeatureEvaluation,
  SubscriptionContext,
} from '../../types/models/FeatureEvaluation';

function evaluateAllFeatures(
  pricingContext: PricingContext,
  subscriptionContext: SubscriptionContext,
  evaluationContext: EvaluationContext,
  simple: boolean = true
): SimpleFeatureEvaluation | DetailedFeatureEvaluation {
  const features = Object.keys(evaluationContext);
  let result: SimpleFeatureEvaluation | DetailedFeatureEvaluation = {};

  for (const featureId of features) {
    result[featureId] = evaluateFeature(
      featureId,
      pricingContext,
      subscriptionContext,
      evaluationContext,
      simple
    );
  }

  return result;
}

function evaluateFeature(
  featureId: string,
  pricingContext: PricingContext,
  subscriptionContext: SubscriptionContext,
  evaluationContext: EvaluationContext,
  simple: boolean = true
):
  | boolean
  | { eval: boolean; used: Record<string, number> | null; limit: Record<string, number> | null } {
  const featureEvaluation: boolean = _evaluate(
    featureId,
    pricingContext,
    subscriptionContext,
    evaluationContext,
    simple
  );

  if (simple) {
    return featureEvaluation;
  } else {
    return { eval: featureEvaluation, used: null, limit: null };
  }
}

function _evaluate(
  featureId: string,
  pricingContext: PricingContext,
  subscriptionContext: SubscriptionContext,
  evaluationContext: EvaluationContext,
  simple: boolean = true
): boolean {
  // TODO: Perform Evaluation
  return true;
}

export { evaluateAllFeatures, evaluateFeature };